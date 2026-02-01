export const dynamic = "force-dynamic";

import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/actions";

export default async function BlogPage() {
    const posts = await getPosts(); // Only published

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container max-w-5xl">
                {/* Page Header */}
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
                        The Archive
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                        Explorations in code, design, and life.
                    </p>
                </div>

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-20 border rounded-2xl bg-muted/20">
                        <p className="text-lg text-muted-foreground">
                            No posts published yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
