export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    FileText,
    Eye,
    Edit,
    Clock,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Bento Card Component
function BentoCard({
    children,
    className,
    href,
}: {
    children: React.ReactNode;
    className?: string;
    href?: string;
}) {
    const baseClassName = cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        href && "cursor-pointer",
        className,
    );

    if (href) {
        return (
            <Link href={href} className={baseClassName}>
                {children}
            </Link>
        );
    }

    return <div className={baseClassName}>{children}</div>;
}

// Stat Card for the bento grid
function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    className,
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    trend?: string;
    className?: string;
}) {
    return (
        <BentoCard className={className}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="text-4xl font-bold tracking-tight">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            {trend}
                        </div>
                    )}
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
        </BentoCard>
    );
}

export default async function DashboardPage() {
    const posts = await getPosts(true);
    const published = posts.filter((p) => p.published).length;
    const drafts = posts.filter((p) => !p.published).length;
    const recentPosts = posts.slice(0, 4);

    return (
        <div className="p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Overview
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Welcome back. Here&apos;s your content summary.
                    </p>
                </div>
                <Button asChild size="lg" className="group w-fit">
                    <Link href="/dashboard/editor/new">
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Bento Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Row */}
                <StatCard
                    label="Total Posts"
                    value={posts.length}
                    icon={FileText}
                    className="lg:col-span-1"
                />
                <StatCard
                    label="Published"
                    value={published}
                    icon={Eye}
                    trend="+2 this week"
                    className="lg:col-span-1"
                />
                <StatCard
                    label="Drafts"
                    value={drafts}
                    icon={Edit}
                    className="lg:col-span-1"
                />
                <StatCard
                    label="Avg. Read Time"
                    value="4 min"
                    icon={Clock}
                    className="lg:col-span-1"
                />

                {/* Recent Posts - Large Card */}
                <BentoCard className="md:col-span-2 lg:col-span-3 lg:row-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Recent Posts</h2>
                        <Link
                            href="/dashboard/posts"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {recentPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-1">No posts yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start creating content for your readers.
                            </p>
                            <Button asChild size="sm">
                                <Link href="/dashboard/editor/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Post
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/dashboard/editor/${post.id}`}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium truncate">
                                                {post.title}
                                            </h3>
                                            <Badge
                                                variant={
                                                    post.published
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="shrink-0 text-xs"
                                            >
                                                {post.published
                                                    ? "Published"
                                                    : "Draft"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                                            {post.excerpt || "No excerpt"}
                                        </p>
                                    </div>
                                    <time className="text-xs text-muted-foreground shrink-0 ml-4">
                                        {formatDistanceToNow(
                                            new Date(post.createdAt),
                                            { addSuffix: true },
                                        )}
                                    </time>
                                </Link>
                            ))}
                        </div>
                    )}
                </BentoCard>

                {/* Quick Actions Card */}
                <BentoCard className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                    <h2 className="text-xl font-semibold mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid gap-2">
                        <Button
                            asChild
                            variant="outline"
                            className="justify-start h-auto py-3"
                        >
                            <Link href="/dashboard/editor/new">
                                <FileText className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <p className="font-medium">New Post</p>
                                    <p className="text-xs text-muted-foreground">
                                        Create a new article
                                    </p>
                                </div>
                            </Link>
                        </Button>
                        {/* Settings button removed */}
                        <Button
                            asChild
                            variant="outline"
                            className="justify-start h-auto py-3"
                        >
                            <Link href="/" target="_blank">
                                <Eye className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <p className="font-medium">View Site</p>
                                    <p className="text-xs text-muted-foreground">
                                        Open your blog
                                    </p>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}
