"use server";

import { prisma } from "@/lib/prisma";
import { auth, isAdmin } from "@/auth";
import { revalidatePath } from "next/cache";
import { retryOperation, withTimeout } from "@/lib/async-utils";
import { commentSchema } from "@/lib/validations";
import {
    checkRateLimit,
    RateLimits,
    formatTimeRemaining,
} from "@/lib/rate-limit";

// ========================================
// Post Actions (Admin Only)
// ========================================

export async function createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    thumbnail: string;
    published?: boolean;
}) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    // Rate limit check
    const session = await auth();
    const rateLimitResult = checkRateLimit(
        `post-create:${session?.user?.id}`,
        RateLimits.POST_MUTATION,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Rate limit exceeded. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    const post = await prisma.post.create({
        data: {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || "",
            content: data.content,
            thumbnail: data.thumbnail,
            published: data.published || false,
        },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return post;
}

export async function updatePost(
    id: string,
    data: {
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        thumbnail?: string;
        published?: boolean;
    },
) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    // Rate limit check
    const session = await auth();
    const rateLimitResult = checkRateLimit(
        `post-update:${session?.user?.id}`,
        RateLimits.POST_MUTATION,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Rate limit exceeded. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    const post = await prisma.post.update({
        where: { id },
        data,
    });

    revalidatePath("/");
    revalidatePath(`/${post.slug}`);
    revalidatePath("/dashboard");
    return post;
}

export async function deletePost(id: string) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    // Rate limit check
    const session = await auth();
    const rateLimitResult = checkRateLimit(
        `post-delete:${session?.user?.id}`,
        RateLimits.POST_MUTATION,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Rate limit exceeded. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    await prisma.post.delete({
        where: { id },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
}

export async function bulkDeletePosts(postIds: string[]) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    if (!postIds || postIds.length === 0) {
        throw new Error("No posts selected");
    }

    // Rate limit check
    const session = await auth();
    const rateLimitResult = checkRateLimit(
        `post-bulk-delete:${session?.user?.id}`,
        RateLimits.POST_MUTATION,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Rate limit exceeded. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    await prisma.post.deleteMany({
        where: {
            id: { in: postIds },
        },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { count: postIds.length };
}

// ========================================
// Comment Actions (Authenticated Users)
// ========================================

export async function createComment(postId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to comment");
    }

    // Rate limit check
    const rateLimitResult = checkRateLimit(
        `comment-create:${session.user.id}`,
        RateLimits.COMMENT_CREATE,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Too many comments. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    // Validate input with Zod
    const validation = commentSchema.safeParse({ content, postId });
    if (!validation.success) {
        const errors = validation.error.errors.map((e) => e.message).join(", ");
        throw new Error(errors);
    }

    const comment = await prisma.comment.create({
        data: {
            content: validation.data.content,
            postId: validation.data.postId,
            userId: session.user.id,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    revalidatePath(`/`);
    return comment;
}

export async function deleteComment(commentId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Rate limit check
    const rateLimitResult = checkRateLimit(
        `comment-delete:${session.user.id}`,
        RateLimits.COMMENT_DELETE,
    );
    if (!rateLimitResult.success) {
        throw new Error(
            `Too many deletions. Please try again in ${formatTimeRemaining(rateLimitResult.resetTime)}`,
        );
    }

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        throw new Error("Comment not found");
    }

    // Only allow owner or admin to delete
    const admin = await isAdmin();
    if (comment.userId !== session.user.id && !admin) {
        throw new Error("Unauthorized");
    }

    await prisma.comment.delete({
        where: { id: commentId },
    });

    revalidatePath("/");
}

// Increment post view counter
export async function incrementPostViews(slug: string) {
    try {
        // Use retry logic with timeout to handle race conditions and transient failures
        await retryOperation(
            () =>
                withTimeout(
                    () =>
                        prisma.post.update({
                            where: { slug },
                            data: {
                                views: {
                                    increment: 1,
                                },
                            },
                        }),
                    3000, // 3 second timeout
                ),
            {
                maxRetries: 2, // Retry once if fails
                delayMs: 500, // 500ms delay between retries
                backoff: false, // No exponential backoff for view count
            },
        );
    } catch (error) {
        // Silent fail - view count is not critical
        // Log for monitoring but don't throw error
        console.error("Failed to increment post views:", error);
    }
}

// Toggle post like
export async function togglePostLike(postId: string, increment: boolean) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    await prisma.post.update({
        where: { id: postId },
        data: {
            likes: {
                [increment ? "increment" : "decrement"]: 1,
            },
        },
    });

    revalidatePath("/");
}

// ========================================
// Read Operations (Public)
// ========================================

export async function getPosts(includeUnpublished = false) {
    return prisma.post.findMany({
        where: includeUnpublished ? {} : { published: true },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            thumbnail: true,
            views: true,
            published: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function getPostBySlug(slug: string) {
    return prisma.post.findUnique({
        where: { slug },
        include: {
            comments: {
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
        },
    });
}

export async function getPostById(id: string) {
    return prisma.post.findUnique({
        where: { id },
    });
}
