"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, LogIn } from "lucide-react";

export function AuthModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<"google" | "github" | null>(null);

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="group">
                    <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Sign In
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <LogIn className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold tracking-tight">
                        Welcome Back
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Sign in to access your dashboard and manage your content
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-6">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 relative group hover:border-primary/50 transition-all"
                        onClick={() => handleLogin("google")}
                        disabled={!!loading}
                    >
                        {loading === "google" ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Icon
                                    icon="flat-color-icons:google"
                                    className="mr-2 h-5 w-5"
                                />
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 relative group hover:border-primary/50 transition-all"
                        onClick={() => handleLogin("github")}
                        disabled={!!loading}
                    >
                        {loading === "github" ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Icon
                                    icon="mdi:github"
                                    className="mr-2 h-5 w-5"
                                />
                                Continue with GitHub
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                </div>
            </DialogContent>
        </Dialog>
    );
}
