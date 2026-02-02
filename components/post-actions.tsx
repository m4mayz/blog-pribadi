"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { togglePostLike } from "@/lib/actions";

interface PostActionsProps {
    postId: string;
    initialLikes?: number;
    commentsCount: number;
    onCommentClick: () => void;
}

export function PostActions({
    postId,
    initialLikes = 0,
    commentsCount,
    onCommentClick,
}: PostActionsProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Load liked state from localStorage on mount
    useEffect(() => {
        const likedPosts = JSON.parse(
            localStorage.getItem("likedPosts") || "[]",
        );
        setIsLiked(likedPosts.includes(postId));
    }, [postId]);

    const handleLike = () => {
        startTransition(async () => {
            try {
                const newIsLiked = !isLiked;

                // Optimistic update
                setIsLiked(newIsLiked);
                setLikes((prev) => (newIsLiked ? prev + 1 : prev - 1));

                // Update localStorage
                const likedPosts = JSON.parse(
                    localStorage.getItem("likedPosts") || "[]",
                );
                if (newIsLiked) {
                    likedPosts.push(postId);
                } else {
                    const index = likedPosts.indexOf(postId);
                    if (index > -1) likedPosts.splice(index, 1);
                }
                localStorage.setItem("likedPosts", JSON.stringify(likedPosts));

                // Persist to database
                await togglePostLike(postId, newIsLiked);

                toast.success(newIsLiked ? "Liked!" : "Unliked!");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                // Revert on error
                setIsLiked(!isLiked);
                setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
                toast.error("Failed to like post");
            }
        });
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
        <TooltipProvider>
            <div className="flex items-center gap-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Share</p>
                    </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
                                onClick={handleLike}
                                disabled={isPending}
                            >
                                <Heart
                                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isLiked ? "Unlike" : "Like"}</p>
                        </TooltipContent>
                    </Tooltip>
                    <span className="text-sm text-muted-foreground min-w-5">
                        {likes}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={onCommentClick}
                            >
                                <MessageCircle className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Comment</p>
                        </TooltipContent>
                    </Tooltip>
                    <span className="text-sm text-muted-foreground min-w-5">
                        {commentsCount}
                    </span>
                </div>
            </div>
        </TooltipProvider>
    );
}
