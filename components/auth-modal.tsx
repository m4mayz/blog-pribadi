"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => void;
}

export function AuthModal({
    children,
    open,
    onOpenChange,
    onOpen,
}: AuthModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState<"google" | "github" | null>(null);

    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && onOpen) {
            onOpen();
        }
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    const handleLogin = async (provider: "google" | "github") => {
        setLoading(provider);
        try {
            await signIn(provider, { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {children ? (
                <DialogTrigger asChild>{children}</DialogTrigger>
            ) : open === undefined ? (
                <DialogTrigger asChild>
                    <Button size="sm">Sign In</Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className="sm:max-w-85 p-6" showCloseButton={false}>
                <DialogTitle className="sr-only">Sign In</DialogTitle>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center gap-3 cursor-pointer relative"
                        onClick={() => handleLogin("google")}
                        disabled={!!loading}
                    >
                        {loading === "google" ? (
                            <Loader2 className="h-5 w-5 animate-spin absolute left-4" />
                        ) : (
                            <Icon
                                icon="flat-color-icons:google"
                                className="h-5 w-5 absolute left-4"
                            />
                        )}
                        <span>Continue with Google</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center gap-3 cursor-pointer relative"
                        onClick={() => handleLogin("github")}
                        disabled={!!loading}
                    >
                        {loading === "github" ? (
                            <Loader2 className="h-5 w-5 animate-spin absolute left-4" />
                        ) : (
                            <Icon
                                icon="mdi:github"
                                className="h-5 w-5 absolute left-4"
                            />
                        )}
                        <span>Continue with GitHub</span>
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                    Your login data is secure and protected
                </p>
            </DialogContent>
        </Dialog>
    );
}
