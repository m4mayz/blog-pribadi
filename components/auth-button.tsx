"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2 } from "lucide-react";

export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <Button disabled variant="ghost" size="sm">
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                    {session.user?.name || session.user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Button variant="default" size="sm" onClick={() => signIn()}>
            <LogIn className="h-4 w-4 mr-2" />
            Login
        </Button>
    );
}
