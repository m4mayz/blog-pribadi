import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";

interface PostCardProps {
    post: {
        id: string;
        slug: string;
        title: string;
        excerpt: string | null;
        thumbnail: string;
        views: number;
        createdAt: Date;
        published?: boolean;
    };
    showStatus?: boolean;
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
    const wordCount = post.excerpt?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / 50) || 1;

    return (
        <Link href={`/${post.slug}`} className="group block h-full">
            <article className="flex flex-col h-full border border-border/50 rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-border">
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-muted relative">
                    <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <time dateTime={new Date(post.createdAt).toISOString()}>
                            {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                            })}
                        </time>
                        <span>•</span>
                        <span>{readingTime} min read</span>
                        {post.views > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {post.views}
                                </span>
                            </>
                        )}
                        {showStatus && post.published !== undefined && (
                            <Badge
                                variant={
                                    post.published ? "default" : "secondary"
                                }
                                className="ml-auto"
                            >
                                {post.published ? "Published" : "Draft"}
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                            {post.excerpt}
                        </p>
                    )}
                </div>
            </article>
        </Link>
    );
}
