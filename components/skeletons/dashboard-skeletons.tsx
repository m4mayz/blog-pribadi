import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardStatsSkeleton() {
    return (
        <>
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-20" />
                            {i === 1 && <Skeleton className="h-3 w-28" />}
                        </div>
                        <Skeleton className="h-11 w-11 rounded-xl" />
                    </div>
                </div>
            ))}
        </>
    );
}

export function DashboardRecentPostsSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:col-span-2 lg:col-span-3 lg:row-span-2">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 -mx-3 rounded-lg"
                    >
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-3 w-20 ml-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardPostListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
            </div>

            {/* Post List */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border"
                    >
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardEditorSkeleton() {
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 p-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-px w-full" />
                    <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="w-96 border-l p-6 space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
