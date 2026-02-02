"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { CommentSidebar } from "@/components/comment-sidebar";
import { PostActions } from "@/components/post-actions";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface PostPageClientProps {
    post: {
        id: string;
        title: string;
        excerpt: string | null;
        content: string;
        thumbnail: string;
        views: number;
        likes: number;
        createdAt: string;
        comments: Comment[];
    };
    readingTime: number;
}

export function PostPageClient({ post, readingTime }: PostPageClientProps) {
    const [isCommentOpen, setIsCommentOpen] = useState(false);

    return (
        <>
            <div className="min-h-screen pt-25 pb-20">
                <article className="container-compact">
                    {/* Header - Medium.com style: Title first */}
                    <header className="mb-10">
                        <h1
                            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
                            style={{
                                fontFamily: "var(--font-article-heading)",
                            }}
                        >
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center justify-between gap-4 py-4 border-y">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <time
                                    dateTime={new Date(
                                        post.createdAt,
                                    ).toISOString()}
                                >
                                    {formatDistanceToNow(
                                        new Date(post.createdAt),
                                        {
                                            addSuffix: true,
                                        },
                                    )}
                                </time>
                                <span>•</span>
                                <span>{readingTime} min read</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {post.views + 1}
                                </span>
                            </div>

                            {/* Action buttons - Medium style */}
                            <PostActions
                                postId={post.id}
                                initialLikes={post.likes}
                                commentsCount={post.comments.length}
                                onCommentClick={() => setIsCommentOpen(true)}
                            />
                        </div>
                    </header>

                    {/* Featured Image - now below header */}
                    <div className="aspect-21/9 overflow-hidden rounded-lg mb-12">
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            width={1200}
                            height={514}
                            priority
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Content - Medium.com inspired styling */}
                    <div className="prose-medium">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                </article>
            </div>

            {/* Comment Sidebar */}
            <CommentSidebar
                postId={post.id}
                comments={post.comments.map((c) => ({
                    ...c,
                    createdAt: new Date(c.createdAt),
                }))}
                isOpen={isCommentOpen}
                onClose={() => setIsCommentOpen(false)}
            />
        </>
    );
}
