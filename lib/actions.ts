"use server";

import { prisma } from "@/lib/prisma";
import { auth, isAdmin } from "@/auth";
import { revalidatePath } from "next/cache";

// ========================================
// Post Actions (Admin Only)
// ========================================

export async function createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    published?: boolean;
}) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    const post = await prisma.post.create({
        data: {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || "",
            content: data.content,
            published: data.published || false,
        },
    });

    revalidatePath("/blog");
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
        published?: boolean;
    },
) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    const post = await prisma.post.update({
        where: { id },
        data,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/dashboard");
    return post;
}

export async function deletePost(id: string) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized");
    }

    await prisma.post.delete({
        where: { id },
    });

    revalidatePath("/blog");
    revalidatePath("/dashboard");
}

// ========================================
// Comment Actions (Authenticated Users)
// ========================================

export async function createComment(postId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to comment");
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            postId,
            userId: session.user.id,
        },
        include: {
            user: {
                select: { name: true, image: true },
            },
        },
    });

    revalidatePath(`/blog`);
    return comment;
}

export async function deleteComment(commentId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
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

    revalidatePath("/blog");
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
