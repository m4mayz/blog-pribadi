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
import { AuthModal } from "@/components/auth-modal";
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
}

// ... (existing imports, but remove useState if confirm logic moves - actually useState is fine for optimistics)

export function CommentSidebar({
    postId,
    comments,
    isOpen,
    onClose,
}: CommentSidebarProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [optimisticComments, setOptimisticComments] = useState(comments);

    // Sync optimistic state with props to prevent race conditions
    useEffect(() => {
        setOptimisticComments(comments);
    }, [comments]);

    const handleSubmit = () => {
        // Client-side validation
        if (!content.trim()) {
            setError("Comment cannot be empty");
            return;
        }
        if (content.length > 5000) {
            setError("Comment must be less than 5000 characters");
            return;
        }

        setError(null);

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
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to post comment";
                setError(errorMessage);
                toast.error(errorMessage);
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
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Comments section"
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-background shadow-2xl z-110 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 id="comments-title" className="text-xl font-bold">
                            Comments ({optimisticComments.length})
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                            aria-label="Close comments"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </div>

                    {/* Comment Form */}
                    {session && (
                        <div className="p-6 border-b">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                                aria-label="Write a comment"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        className="h-8 w-8"
                                        aria-label={`${session.user?.name || "User"}'s avatar`}
                                    >
                                        <AvatarImage
                                            src={
                                                session.user?.image || undefined
                                            }
                                            alt={`${session.user?.name || "User"}'s profile picture`}
                                        />
                                        <AvatarFallback>
                                            {session.user?.name?.charAt(0) ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            id="comment-input"
                                            value={content}
                                            onChange={(e) => {
                                                setContent(e.target.value);
                                                setError(null);
                                            }}
                                            placeholder="Write a comment..."
                                            rows={3}
                                            disabled={isPending}
                                            aria-label="Comment text"
                                            aria-describedby={
                                                error
                                                    ? "comment-error"
                                                    : "comment-counter"
                                            }
                                            aria-invalid={
                                                error ? "true" : "false"
                                            }
                                            className={
                                                error
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {error && (
                                            <p
                                                id="comment-error"
                                                className="text-sm text-destructive"
                                                role="alert"
                                            >
                                                {error}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span
                                                id="comment-counter"
                                                className="text-xs text-muted-foreground"
                                                aria-live="polite"
                                            >
                                                {content.length}/5000 characters
                                            </span>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    !content.trim() || isPending
                                                }
                                                size="sm"
                                                aria-label="Post comment"
                                            >
                                                {isPending && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Post Comment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {!session && (
                        <div className="p-6 border-b text-center text-muted-foreground">
                            <p className="mb-4">
                                <AuthModal>
                                    <span className="underline cursor-pointer hover:text-primary font-medium">
                                        Sign in
                                    </span>
                                </AuthModal>{" "}
                                to leave a comment
                            </p>
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
            </aside>
        </>
    );
}
