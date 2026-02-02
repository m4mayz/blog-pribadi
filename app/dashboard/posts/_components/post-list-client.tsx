"use client";

import { useMemo, useState, useDeferredValue } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar, Eye, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    thumbnail: string | null; // Allow null for compatibility
    views: number;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface PostListClientProps {
    initialPosts: Post[];
}

export function PostListClient({ initialPosts }: PostListClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "published" | "draft"
    >("all");
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Initialize Fuse
    const fuse = useMemo(
        () =>
            new Fuse(initialPosts, {
                keys: ["title", "excerpt", "slug"],
                threshold: 0.3,
                includeScore: true,
            }),
        [initialPosts],
    );

    // Filter Posts
    const filteredPosts = useMemo(() => {
        let result = initialPosts;

        // 1. Status Filter
        if (statusFilter !== "all") {
            result = result.filter((post) =>
                statusFilter === "published" ? post.published : !post.published,
            );
        }

        // 2. Search Filter (if term exists)
        if (deferredSearchTerm.trim()) {
            // Re-create fuse for the filtered subset?
            // Better to search first then filter by status?
            // Or search using the existing fuse instance which has ALL posts.
            // If we search using global fuse, we get results from all statuses.
            // Then we filter those results by status.

            const searchResults = fuse.search(deferredSearchTerm);
            const searchItems = searchResults.map((res) => res.item);

            // Intersect search results with current result (status filtered)
            // But doing it strictly: Search -> then Filter by status is efficient.
            result = searchItems.filter((p) => {
                if (statusFilter === "all") return true;
                return statusFilter === "published"
                    ? p.published
                    : !p.published;
            });
        }

        return result;
    }, [deferredSearchTerm, statusFilter, initialPosts, fuse]);

    return (
        <div className="space-y-6">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                    <Button
                        variant={statusFilter === "all" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="h-8"
                    >
                        All
                    </Button>
                    <Button
                        variant={
                            statusFilter === "published" ? "default" : "ghost"
                        }
                        size="sm"
                        onClick={() => setStatusFilter("published")}
                        className="h-8"
                    >
                        Published
                    </Button>
                    <Button
                        variant={statusFilter === "draft" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter("draft")}
                        className="h-8"
                    >
                        Drafts
                    </Button>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card border-border"
                    />
                </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-card/50">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No posts found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm
                            ? `No results for "${searchTerm}"`
                            : `No ${statusFilter !== "all" ? statusFilter : ""} posts found.`}
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/editor/new">Create Post</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm"
                        >
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/editor/${post.id}`}
                                        className="font-semibold hover:text-primary transition-colors truncate text-lg"
                                    >
                                        {post.title}
                                    </Link>
                                    <Badge
                                        variant={
                                            post.published
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="shrink-0"
                                    >
                                        {post.published ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate max-w-2xl">
                                    {post.excerpt || "No excerpt"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDistanceToNow(
                                            new Date(post.createdAt),
                                            {
                                                addSuffix: true,
                                            },
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {post.views} views
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:self-center self-end">
                                {post.published && (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        title="View Live"
                                    >
                                        <Link
                                            href={`/${post.slug}`}
                                            target="_blank"
                                        >
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/dashboard/editor/${post.id}`}>
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
