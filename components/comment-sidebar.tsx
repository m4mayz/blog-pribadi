"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment, deleteComment } from "@/lib/actions";
import { Loader2, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface CommentSidebarProps {
    postId: string;
    comments: Comment[];
    isOpen: boolean;
    onClose: () => void;
    adminId?: string;
}

// ... (existing imports, but remove useState if confirm logic moves - actually useState is fine for optimistics)

export function CommentSidebar({
    postId,
    comments,
    isOpen,
    onClose,
    adminId,
}: CommentSidebarProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [optimisticComments, setOptimisticComments] = useState(comments);

    // Sync optimistic state with props to prevent race conditions
    useEffect(() => {
        setOptimisticComments(comments);
    }, [comments]);

    const handleSubmit = () => {
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                const newComment = await createComment(postId, content);
                setOptimisticComments((prev) => [
                    newComment as unknown as Comment,
                    ...prev,
                ]);
                setContent("");
                toast.success("Comment posted!");
            } catch (error) {
                console.error("Failed to post comment:", error);
                toast.error("Failed to post comment");
            }
        });
    };

    const handleDelete = (commentId: string) => {
        // No native confirm here, handled by AlertDialog
        startTransition(async () => {
            try {
                await deleteComment(commentId);
                setOptimisticComments((prev) =>
                    prev.filter((c) => c.id !== commentId),
                );
                toast.success("Comment deleted");
            } catch (error) {
                console.error("Failed to delete comment:", error);
                toast.error("Failed to delete comment");
            }
        });
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/25 z-100 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background shadow-2xl z-110 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-bold">
                            Comments ({optimisticComments.length})
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Comment Form */}
                    {session && (
                        <div className="p-6 border-b">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={session.user?.image || undefined}
                                    />
                                    <AvatarFallback>
                                        {session.user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        value={content}
                                        onChange={(e) =>
                                            setContent(e.target.value)
                                        }
                                        placeholder="Write a comment..."
                                        rows={3}
                                        disabled={isPending}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={
                                                !content.trim() || isPending
                                            }
                                            size="sm"
                                        >
                                            {isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!session && (
                        <div className="p-6 border-b text-center text-muted-foreground">
                            <p className="mb-4">Sign in to leave a comment</p>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {optimisticComments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No comments yet. Be the first to comment!
                            </p>
                        ) : (
                            optimisticComments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="space-y-3 pb-6 border-b last:border-0"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        comment.user.image ||
                                                        undefined
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {comment.user.name?.charAt(
                                                        0,
                                                    ) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm">
                                                        {comment.user.name ||
                                                            "Anonymous"}
                                                    </p>
                                                    {adminId &&
                                                        adminId ===
                                                            comment.user.id && (
                                                            <Badge
                                                                variant="default"
                                                                className="h-4 px-1 text-[10px]"
                                                            >
                                                                Author
                                                            </Badge>
                                                        )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                comment.createdAt,
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                        {session?.user?.id ===
                                            comment.user.id && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={isPending}
                                                        className="h-8 w-8 text-destructive/80 hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete Comment?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot
                                                            be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDelete(
                                                                    comment.id,
                                                                )
                                                            }
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
