"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileEdit,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/posts", icon: FileText, label: "Posts" },
    { href: "/dashboard/editor/new", icon: FileEdit, label: "New Post" },
];

interface DashboardSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function DashboardSidebar({
    collapsed,
    setCollapsed,
}: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64",
            )}
        >
            {/* Logo / Brand */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4 transition-all duration-300">
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                    )}
                >
                    <Link
                        href="/dashboard"
                        className="font-heading text-lg font-bold tracking-tight whitespace-nowrap"
                    >
                        Dashboard
                    </Link>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "h-8 w-8 transition-all duration-300",
                        collapsed ? "mx-auto" : "ml-auto",
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                            pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-300",
                                collapsed ? "justify-center px-0" : "px-3",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-300",
                                    !isActive && "group-hover:scale-110",
                                )}
                            />
                            <span
                                className={cn(
                                    "overflow-hidden transition-all duration-300 whitespace-nowrap",
                                    collapsed
                                        ? "w-0 opacity-0 hidden"
                                        : "w-auto opacity-100",
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3 flex flex-col gap-2 bg-card">
                <div
                    className={cn(
                        "flex items-center",
                        collapsed ? "justify-center" : "justify-between px-3",
                    )}
                >
                    <span
                        className={cn(
                            "text-sm font-medium text-muted-foreground overflow-hidden transition-all duration-300 whitespace-nowrap",
                            collapsed
                                ? "w-0 opacity-0 hidden"
                                : "w-auto opacity-100",
                        )}
                    >
                        Theme
                    </span>
                    <ThemeToggle />
                </div>

                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground",
                        collapsed ? "justify-center px-0" : "px-3",
                    )}
                    title={collapsed ? "Exit Dashboard" : undefined}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span
                        className={cn(
                            "overflow-hidden transition-all duration-300 whitespace-nowrap",
                            collapsed
                                ? "w-0 opacity-0 hidden"
                                : "w-auto opacity-100",
                        )}
                    >
                        Exit Dashboard
                    </span>
                </Link>
            </div>
        </aside>
    );
}
