import { PostGridSkeleton } from "@/components/skeletons/post-skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen pt-32 pb-20">
            {/* Hero Section Skeleton */}
            <section className="container-compact mb-16">
                <div className="text-center space-y-4 animate-pulse">
                    <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto" />
                    <div className="h-6 bg-muted rounded-lg w-2/3 mx-auto" />
                </div>
            </section>

            {/* Posts Grid Skeleton */}
            <section className="container">
                <PostGridSkeleton count={6} />
            </section>
        </div>
    );
}
