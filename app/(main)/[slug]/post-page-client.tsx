"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CommentSidebar } from "@/components/comment-sidebar";
import { PostActions } from "@/components/post-actions";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^?\s]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

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
                                    aria-label={`Published ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}`}
                                >
                                    {formatDistanceToNow(
                                        new Date(post.createdAt),
                                        {
                                            addSuffix: true,
                                        },
                                    )}
                                </time>
                                <span aria-hidden="true">•</span>
                                <span aria-label={`${readingTime} minute read`}>
                                    {readingTime} min read
                                </span>
                                <span aria-hidden="true">•</span>
                                <span
                                    className="flex items-center gap-1"
                                    aria-label={`${post.views + 1} views`}
                                >
                                    <Eye
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    {post.views + 1}
                                </span>
                            </div>

                            {/* Action buttons - Medium style */}
                            <PostActions
                                postId={post.id}
                                initialLikes={post.likes}
                                commentsCount={post.comments.length}
                                onCommentClick={() => setIsCommentOpen(true)}
                                onCommentClose={() => setIsCommentOpen(false)}
                            />
                        </div>
                    </header>

                    {/* Featured Image - now below header */}
                    <div className="aspect-video overflow-hidden  mb-12">
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            width={1280}
                            height={720}
                            priority
                            className="object-cover w-full h-full"
                        />
                    </div>

                    {/* Content - Medium.com inspired styling */}
                    <div className="prose-medium">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                // Override paragraph to handle images without nesting issues
                                p: ({ node, children, ...props }) => {
                                    // Check if paragraph only contains an image by checking AST node
                                    const hasOnlyImage =
                                        node?.children?.length === 1 &&
                                        node.children[0].type === "element" &&
                                        node.children[0].tagName === "img";

                                    // Check if paragraph only contains a link (could be YouTube embed)
                                    const hasOnlyLink =
                                        node?.children?.length === 1 &&
                                        node.children[0].type === "element" &&
                                        node.children[0].tagName === "a";

                                    // If it's just an image or a standalone link, return children without p wrapper
                                    // This prevents <p> from containing block-level elements like <div>
                                    if (hasOnlyImage || hasOnlyLink) {
                                        return <>{children}</>;
                                    }

                                    return <p {...props}>{children}</p>;
                                },
                                // Center-align images with size support
                                img: ({ alt, src }) => {
                                    const [altText, size] = (alt || "").split(
                                        "|",
                                    );
                                    const sizeClass =
                                        {
                                            large: "w-full max-w-3xl",
                                            medium: "w-2/3 max-w-[507px]",
                                            small: "w-1/3 max-w-[254px]",
                                        }[
                                            size as "large" | "medium" | "small"
                                        ] || "w-full max-w-3xl";

                                    return (
                                        <div className="flex justify-center my-6">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={src}
                                                alt={altText}
                                                className={`${sizeClass} rounded-lg h-auto`}
                                            />
                                        </div>
                                    );
                                },
                                // YouTube embed detection via links
                                a: ({ href, children }) => {
                                    if (!href) {
                                        return <a>{children}</a>;
                                    }

                                    const videoId = extractYouTubeId(href);
                                    if (videoId) {
                                        return (
                                            <div className="flex justify-center my-8">
                                                <div className="w-full max-w-3xl aspect-video">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {children}
                                        </a>
                                    );
                                },
                                // Center-align tables
                                table: ({ children }) => (
                                    <div className="flex justify-center my-6">
                                        <table className="border-collapse">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                // Syntax highlighting for code blocks
                                code: ({ className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(
                                        className || "",
                                    );
                                    const isInline = !match;

                                    return isInline ? (
                                        <code
                                            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <div className="my-6">
                                            <SyntaxHighlighter
                                                style={oneDark as any}
                                                language={match[1]}
                                                PreTag="div"
                                                className="rounded-lg"
                                            >
                                                {String(children).replace(
                                                    /\n$/,
                                                    "",
                                                )}
                                            </SyntaxHighlighter>
                                        </div>
                                    );
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
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
