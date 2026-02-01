export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, FileText, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const posts = await getPosts(true); // Include drafts
    const published = posts.filter((p) => p.published).length;
    const drafts = posts.filter((p) => !p.published).length;

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage and create your content
                        </p>
                    </div>
                    <Button asChild size="lg" className="group">
                        <Link href="/dashboard/editor/new">
                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            New Post
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3 mb-12">
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Posts
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{posts.length}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Published
                                </CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                {published}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Drafts
                                </CardTitle>
                                <Edit className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                {drafts}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Posts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Your Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {posts.length === 0 ? (
                            <div className="text-center py-16 space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">No posts yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Start creating engaging content for your readers.
                                </p>
                                <Button asChild size="lg" className="mt-4">
                                    <Link href="/dashboard/editor/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Post
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/dashboard/editor/${post.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-all group"
                                    >
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        post.published
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {post.published ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {post.excerpt || "No excerpt"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <time>
                                                {formatDistanceToNow(
                                                    new Date(post.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </time>
                                            <Edit className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
