export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, incrementPostViews } from "@/lib/actions";
import { PostPageClient } from "./post-page-client";

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post || !post.published) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.title,
        description: post.excerpt || undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            images: [
                {
                    url: post.thumbnail,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            type: "article",
            publishedTime: post.createdAt.toISOString(),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || undefined,
            images: [post.thumbnail],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post || !post.published) {
        notFound();
    }

    // Increment view count (non-blocking, silent fail)
    // Don't await to prevent blocking page render
    incrementPostViews(slug).catch((error) => {
        console.error("View tracking failed:", error);
    });

    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Get admin user ID for author badge
    const { prisma } = await import("@/lib/prisma");
    const adminEmail = process.env.ADMIN_EMAIL;
    let adminUserId: string | undefined;

    if (adminEmail) {
        const adminUser = await prisma.user.findUnique({
            where: { email: adminEmail },
            select: { id: true },
        });
        adminUserId = adminUser?.id;
    }

    return (
        <PostPageClient
            post={{
                ...post,
                likes: post.likes || 0,
                createdAt: post.createdAt.toISOString(),
                comments: post.comments.map((c) => ({
                    ...c,
                    createdAt: c.createdAt.toISOString(),
                })),
            }}
            readingTime={readingTime}
            authorUserId={adminUserId}
        />
    );
}
