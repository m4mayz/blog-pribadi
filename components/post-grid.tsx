"use client";

import { useMemo, useState, useDeferredValue } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";

interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    thumbnail: string;
    views: number;
    createdAt: Date;
}

interface PostGridProps {
    posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const deferredSearchTerm = useDeferredValue(searchTerm);

    const fuse = useMemo(
        () =>
            new Fuse(posts, {
                keys: ["title", "excerpt"],
                threshold: 0.3,
                includeScore: true,
            }),
        [posts],
    );

    const filteredPosts = useMemo(() => {
        if (!deferredSearchTerm.trim()) {
            return posts;
        }

        const results = fuse.search(deferredSearchTerm);
        return results.map((result) => result.item);
    }, [deferredSearchTerm, fuse, posts]);

    return (
        <div className="space-y-6">
            {/* Search Input - 768px width */}
            <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-card"
                />
            </div>

            {/* Posts Grid - 3 columns on desktop */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No posts found matching &quot;{deferredSearchTerm}&quot;
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
