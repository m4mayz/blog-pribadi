import { PostGrid } from "@/components/post-grid";
import { getPosts } from "@/lib/actions";
import { Suspense } from "react";
import { PostGridSkeleton } from "@/components/skeletons/post-skeletons";

async function PostsSection() {
    const posts = await getPosts(); // Only published posts

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <p>No posts yet. Check back soon!</p>
            </div>
        );
    }

    return <PostGrid posts={posts} />;
}

export default function HomePage() {
    return (
        <div className="min-h-screen pt-32 pb-20">
            {/* Hero Section */}
            <section className="container-compact mb-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold">
                        Learn, Build, Share, Repeat
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A collection of tutorials, insights, and experiences
                        from my journey as a developer.
                    </p>
                </div>
            </section>

            {/* Posts Grid with Suspense */}
            <section className="container">
                <Suspense fallback={<PostGridSkeleton count={6} />}>
                    <PostsSection />
                </Suspense>
            </section>
        </div>
    );
}
