"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment, deleteComment } from "@/lib/actions";
import { Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
    const { data: session, status } = useSession();
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
            } catch (error) {
                console.error("Failed to post comment:", error);
                alert("Failed to post comment");
            }
        });
    };

    const handleDelete = (commentId: string) => {
        if (!confirm("Delete this comment?")) return;

        startTransition(async () => {
            try {
                await deleteComment(commentId);
                setOptimisticComments((prev) =>
                    prev.filter((c) => c.id !== commentId),
                );
            } catch (error) {
                console.error("Failed to delete comment:", error);
                alert("Failed to delete comment");
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                Comments ({optimisticComments.length})
            </h2>

            {/* Comment Form */}
            {status === "loading" ? (
                <Card>
                    <CardContent className="py-4 text-center text-muted-foreground">
                        Loading...
                    </CardContent>
                </Card>
            ) : session ? (
                <Card>
                    <CardContent className="pt-4 space-y-4">
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
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                />
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending || !content.trim()}
                                    size="sm"
                                >
                                    {isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Post Comment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-4 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                            <AuthModal>
                                <span className="underline cursor-pointer hover:text-primary font-medium">
                                    Sign in
                                </span>
                            </AuthModal>
                            <span>to leave a comment.</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            {optimisticComments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                </p>
            ) : (
                <div className="space-y-4">
                    {optimisticComments.map((comment) => (
                        <Card key={comment.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={
                                                comment.user.image || undefined
                                            }
                                        />
                                        <AvatarFallback>
                                            {comment.user.name?.charAt(0) ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {comment.user.name || "Anonymous"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(comment.createdAt),
                                                {
                                                    addSuffix: true,
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {session?.user?.id === comment.user.id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={isPending}
                                        className="h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
