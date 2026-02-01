import { HeroSection } from "@/components/hero-section";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/lib/actions";

export default async function HomePage() {
    const posts = await getPosts(); // Only published posts
    const recentPosts = posts.slice(0, 6);

    return (
        <div className="min-h-screen">
            <HeroSection />

            <section className="container pb-24">
                <div className="flex items-center gap-4 mb-12">
                    <h2 className="text-lg font-medium tracking-tight">
                        Recent Writings
                    </h2>
                    <div className="h-px bg-border flex-1" />
                </div>

                {recentPosts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>The garden is empty. Seeds are being planted.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {recentPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
