"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to monitoring service
        console.error("Dashboard Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="max-w-lg w-full">
                {/* Card Container */}
                <div className="border border-border rounded-2xl p-8 bg-card shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-1">
                                Dashboard Error
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Something went wrong while loading this page.
                            </p>
                        </div>
                    </div>

                    {/* Error Details (development only) */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                            <p className="text-xs font-semibold mb-2 text-muted-foreground">
                                Error Details (dev mode):
                            </p>
                            <p className="text-xs font-mono text-destructive break-all leading-relaxed">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">What you can try:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Refresh the page to reload data</li>
                            <li>Check your internet connection</li>
                            <li>Clear browser cache and try again</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={reset}
                            variant="default"
                            className="flex-1 gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            className="flex-1 gap-2"
                        >
                            <Link href="/dashboard">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard Home
                            </Link>
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border">
                        <p className="text-xs text-center text-muted-foreground">
                            If this error persists, please refresh the page or
                            contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
