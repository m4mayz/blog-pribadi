export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getPostBySlug } from "@/lib/actions";
import { CommentSection } from "@/components/comment-section";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post || !post.published) {
        notFound();
    }

    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen pt-32 pb-20">
            <article className="container max-w-3xl">
                {/* Navigation */}
                <div className="mb-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Archive
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6 md:justify-start justify-center">
                        <time>
                            {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                            })}
                        </time>
                        <span>•</span>
                        <span>{readingTime} min read</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight mb-8">
                        {post.title}
                    </h1>

                    <div className="h-1 w-20 bg-primary md:mx-0 mx-auto" />
                </header>

                {/* Content */}
                <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-lg leading-relaxed font-sans">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t">
                    <CommentSection
                        postId={post.id}
                        comments={post.comments.map((c) => ({
                            ...c,
                            createdAt: new Date(c.createdAt),
                        }))}
                    />
                </div>
            </article>
        </div>
    );
}
