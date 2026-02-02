"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar with lifted state */}
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* Main content with dynamic padding transition */}
            <main
                className={cn(
                    "flex-1 min-h-screen transition-all duration-300 ease-in-out",
                    collapsed ? "ml-16" : "ml-64",
                )}
            >
                {children}
            </main>
        </div>
    );
}
