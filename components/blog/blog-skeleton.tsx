import { Skeleton } from "@/components/ui/skeleton"

export function BlogSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 bg-zinc-800" />
                <Skeleton className="h-6 w-20 bg-zinc-800" />
                <Skeleton className="h-6 w-14 bg-zinc-800" />
            </div>
            <Skeleton className="h-48 w-full bg-zinc-800 rounded-lg" />
            <Skeleton className="h-6 w-3/4 bg-zinc-800" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-2/3 bg-zinc-800" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-20 bg-zinc-800" />
                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                </div>
                <Skeleton className="h-4 w-16 bg-zinc-800" />
            </div>
        </div>
    )
}

export function BlogGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                    <BlogSkeleton />
                </div>
            ))}
        </div>
    )
}