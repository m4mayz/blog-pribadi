import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight } from "lucide-react";

interface PostCardProps {
    post: {
        id: string;
        slug: string;
        title: string;
        excerpt: string | null;
        createdAt: Date;
        published: boolean;
    };
    showStatus?: boolean;
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <article className="flex flex-col h-full p-6 bg-card hover:bg-muted/30 transition-colors border border-border/50 rounded-2xl">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                        })}
                    </span>
                    {showStatus && (
                        <Badge
                            variant={post.published ? "default" : "secondary"}
                        >
                            {post.published ? "Published" : "Draft"}
                        </Badge>
                    )}
                </div>

                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 group-hover:underline decoration-1 underline-offset-4">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="text-muted-foreground flex-1 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-6 flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
            </article>
        </Link>
    );
}
