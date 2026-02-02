import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PostListClient } from "./_components/post-list-client";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
    const posts = await getPosts(true);

    return (
        <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-heading">
                        Posts
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your blog content.
                    </p>
                </div>
                <Button asChild className="w-fit">
                    <Link href="/dashboard/editor/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {/* Client Side Search/Filter & List */}
            <PostListClient initialPosts={posts} />
        </div>
    );
}
