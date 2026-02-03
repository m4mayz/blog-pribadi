import {
    DashboardStatsSkeleton,
    DashboardRecentPostsSkeleton,
} from "@/components/skeletons/dashboard-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="p-6 md:p-8 lg:p-10">
            {/* Header Skeleton */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-11 w-32 rounded-lg" />
            </div>

            {/* Bento Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <DashboardStatsSkeleton />

                {/* Recent Posts */}
                <DashboardRecentPostsSkeleton />

                {/* Quick Actions Card */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:col-span-2 lg:col-span-1 lg:row-span-2">
                    <Skeleton className="h-7 w-32 mb-4" />
                    <div className="grid gap-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
