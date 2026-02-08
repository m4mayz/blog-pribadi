"use client";

import { useMemo, useState, useDeferredValue, useTransition } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    FileText,
    Calendar,
    Eye,
    ArrowUpRight,
    Trash2,
    X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bulkDeletePosts } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    thumbnail: string | null;
    views: number;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface PostListClientProps {
    initialPosts: Post[];
}

export function PostListClient({ initialPosts }: PostListClientProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "published" | "draft"
    >("all");
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isPending, startTransition] = useTransition();
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

        if (statusFilter !== "all") {
            result = result.filter((post) =>
                statusFilter === "published" ? post.published : !post.published,
            );
        }

        if (deferredSearchTerm.trim()) {
            const searchResults = fuse.search(deferredSearchTerm);
            const searchItems = searchResults.map((res) => res.item);
            result = searchItems.filter((p) => {
                if (statusFilter === "all") return true;
                return statusFilter === "published"
                    ? p.published
                    : !p.published;
            });
        }

        return result;
    }, [deferredSearchTerm, statusFilter, initialPosts, fuse]);

    // Selection handlers
    const togglePostSelection = (postId: string) => {
        const newSelection = new Set(selectedPosts);
        if (newSelection.has(postId)) {
            newSelection.delete(postId);
        } else {
            newSelection.add(postId);
        }
        setSelectedPosts(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedPosts.size === filteredPosts.length) {
            setSelectedPosts(new Set());
        } else {
            setSelectedPosts(new Set(filteredPosts.map((p) => p.id)));
        }
    };

    const clearSelection = () => {
        setSelectedPosts(new Set());
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            try {
                const result = await bulkDeletePosts(Array.from(selectedPosts));
                toast.success(
                    `Successfully deleted ${result.count} post${result.count > 1 ? "s" : ""}`,
                );
                setSelectedPosts(new Set());
                setShowDeleteDialog(false);
                router.refresh();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete posts",
                );
            }
        });
    };

    const selectedPostsData = useMemo(
        () => filteredPosts.filter((p) => selectedPosts.has(p.id)),
        [filteredPosts, selectedPosts],
    );

    return (
        <div className="space-y-6">
            {/* Bulk Action Bar */}
            {selectedPosts.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 p-4 bg-background border border-border rounded-full backdrop-blur-md shadow-lg min-w-[320px]">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={
                                selectedPosts.size === filteredPosts.length
                            }
                            onCheckedChange={toggleSelectAll}
                        />
                        <span className="font-medium text-sm">
                            {selectedPosts.size} post
                            {selectedPosts.size > 1 ? "s" : ""} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

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
                            className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm"
                        >
                            <Checkbox
                                checked={selectedPosts.has(post.id)}
                                onCheckedChange={() =>
                                    togglePostSelection(post.id)
                                }
                                className="mt-1"
                            />
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {selectedPosts.size} Post
                            {selectedPosts.size > 1 ? "s" : ""}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                This action cannot be undone. The following
                                posts will be permanently deleted:
                            </p>
                            <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                                {selectedPostsData.slice(0, 5).map((post) => (
                                    <li key={post.id} className="truncate">
                                        {post.title}
                                    </li>
                                ))}
                                {selectedPostsData.length > 5 && (
                                    <li className="text-muted-foreground">
                                        ...and {selectedPostsData.length - 5}{" "}
                                        more
                                    </li>
                                )}
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
