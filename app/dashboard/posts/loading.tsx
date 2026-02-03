import { DashboardPostListSkeleton } from "@/components/skeletons/dashboard-skeletons";

export default function PostsLoading() {
    return (
        <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-9 bg-muted rounded-lg w-32 animate-pulse" />
                    <div className="h-5 bg-muted rounded-lg w-48 animate-pulse" />
                </div>
                <div className="h-10 bg-muted rounded-lg w-28 animate-pulse" />
            </div>

            {/* Post List */}
            <DashboardPostListSkeleton />
        </div>
    );
}
