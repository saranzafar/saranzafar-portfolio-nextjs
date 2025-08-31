// components/blog-detail/blog-skeleton.tsx
export function BlogDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button Skeleton */}
            <div className="mb-8">
                <div className="animate-pulse h-10 bg-zinc-800 rounded w-32"></div>
            </div>

            {/* Featured Image Skeleton */}
            <div className="animate-pulse bg-zinc-800 rounded-xl mb-8 h-64 md:h-96"></div>

            {/* Title Skeleton */}
            <div className="space-y-3 mb-6">
                <div className="animate-pulse h-12 bg-zinc-800 rounded w-4/5"></div>
                <div className="animate-pulse h-12 bg-zinc-800 rounded w-3/5"></div>
            </div>

            {/* Excerpt Skeleton */}
            <div className="space-y-2 mb-8">
                <div className="animate-pulse h-6 bg-zinc-800 rounded w-full"></div>
                <div className="animate-pulse h-6 bg-zinc-800 rounded w-4/5"></div>
            </div>

            {/* Meta Skeleton */}
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-zinc-800">
                <div className="animate-pulse h-5 bg-zinc-800 rounded w-24"></div>
                <div className="animate-pulse h-5 bg-zinc-800 rounded w-32"></div>
                <div className="animate-pulse h-5 bg-zinc-800 rounded w-24"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="flex gap-2 mb-8">
                <div className="animate-pulse h-6 bg-zinc-800 rounded w-16"></div>
                <div className="animate-pulse h-6 bg-zinc-800 rounded w-20"></div>
                <div className="animate-pulse h-6 bg-zinc-800 rounded w-18"></div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="animate-pulse h-4 bg-zinc-800 rounded w-full"></div>
                        <div className="animate-pulse h-4 bg-zinc-800 rounded w-full"></div>
                        <div className="animate-pulse h-4 bg-zinc-800 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}