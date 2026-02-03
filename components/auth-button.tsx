"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2 } from "lucide-react";

export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <Button
                disabled
                variant="ghost"
                size="sm"
                aria-label="Loading authentication status"
            >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading...</span>
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm text-muted-foreground hidden sm:inline"
                    aria-label="Logged in as"
                >
                    {session.user?.name || session.user?.email}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    aria-label="Logout from account"
                >
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="default"
            size="sm"
            onClick={() => signIn()}
            aria-label="Login to your account"
        >
            <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
            Login
        </Button>
    );
}
