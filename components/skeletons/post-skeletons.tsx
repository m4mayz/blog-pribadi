import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function PostCardSkeleton() {
    return (
        <Card className="flex flex-col h-full border border-border/50 rounded-lg overflow-hidden">
            {/* Thumbnail Skeleton */}
            <Skeleton className="aspect-video w-full" />

            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col gap-3">
                {/* Meta info */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>

                {/* Excerpt */}
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </CardContent>
        </Card>
    );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {/* Search Skeleton */}
            <div className="relative max-w-3xl mx-auto">
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function PostDetailSkeleton() {
    return (
        <div className="min-h-screen pt-25 pb-20">
            <article className="container-compact">
                <header className="mb-10 space-y-6">
                    {/* Title */}
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-4/5" />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between py-4 border-y">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <Skeleton className="aspect-video w-full mb-12 rounded-lg" />

                {/* Content */}
                <div className="space-y-4 max-w-3xl">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            {i % 3 === 0 && <div className="h-4" />}
                        </div>
                    ))}
                </div>
            </article>
        </div>
    );
}
