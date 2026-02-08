"use client";
import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { togglePostLike } from "@/lib/actions";
import { AuthModal } from "@/components/auth-modal";

interface PostActionsProps {
    postId: string;
    initialLikes?: number;
    commentsCount: number;
    onCommentClick: () => void;
    onCommentClose?: () => void;
}

export function PostActions({
    postId,
    initialLikes = 0,
    commentsCount,
    onCommentClick,
    onCommentClose,
}: PostActionsProps) {
    const { data: session } = useSession();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Close comment sidebar when auth modal opens
    useEffect(() => {
        if (showAuthModal && onCommentClose) {
            onCommentClose();
        }
    }, [showAuthModal, onCommentClose]);

    const handleLike = () => {
        if (!session) {
            setShowAuthModal(true);
            return;
        }

        startTransition(async () => {
            try {
                const newIsLiked = !isLiked;

                // Optimistic update
                setIsLiked(newIsLiked);
                setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));

                // Persist to database
                await togglePostLike(postId, newIsLiked);

                toast.success(newIsLiked ? "Liked!" : "Unliked!");
            } catch (error) {
                console.error("Like failed", error);
                // Revert on error
                setIsLiked(!isLiked);
                setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
                toast.error("Failed to like post");
            }
        });
    };

    const handleCommentClick = () => {
        onCommentClick();
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    url: window.location.href,
                });
                toast.success("Shared successfully!");
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Share failed:", error);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <AuthModal
                open={showAuthModal}
                onOpenChange={setShowAuthModal}
                onOpen={onCommentClose}
            />

            <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleShare}
                aria-label="Share this post"
            >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span className="ml-2">Share</span>
            </Button>

            <div
                className="flex items-center gap-1"
                role="group"
                aria-label="Like this post"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 cursor-pointer ${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={handleLike}
                    disabled={isPending}
                    aria-label={
                        isLiked
                            ? `Unlike post (${likes} likes)`
                            : `Like post (${likes} likes)`
                    }
                    aria-pressed={isLiked}
                >
                    <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                        aria-hidden="true"
                    />
                    <span className="ml-2">Like</span>
                </Button>
                <span
                    className="text-sm text-muted-foreground min-w-5"
                    aria-label={`${likes} likes`}
                >
                    {likes}
                </span>
            </div>

            <div
                className="flex items-center gap-1"
                role="group"
                aria-label="View and add comments"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={handleCommentClick}
                    aria-label={`View comments (${commentsCount} comments)`}
                >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span className="ml-2">Comment</span>
                </Button>
                <span
                    className="text-sm text-muted-foreground min-w-5"
                    aria-label={`${commentsCount} comments`}
                >
                    {commentsCount}
                </span>
            </div>
        </div>
    );
}
