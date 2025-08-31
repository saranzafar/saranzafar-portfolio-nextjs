// app/blogs/loading.tsx
import { BlogGridSkeleton } from "@/components/blog/blog-skeleton"

export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex items-center justify-center md:justify-between flex-wrap gap-4 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-64 mb-2"></div>
          <div className="h-4 bg-zinc-800 rounded w-48"></div>
        </div>
        <div className="flex gap-2">
          <div className="animate-pulse h-10 bg-zinc-800 rounded w-24"></div>
          <div className="animate-pulse h-10 bg-zinc-800 rounded w-24"></div>
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div className="w-full lg:max-w-lg">
          <div className="animate-pulse h-10 bg-zinc-800 rounded"></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="animate-pulse h-10 bg-zinc-800 rounded w-44"></div>
          <div className="animate-pulse h-10 bg-zinc-800 rounded w-40"></div>
          <div className="animate-pulse h-10 bg-zinc-800 rounded w-40"></div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-8 text-center">
        <div className="animate-pulse h-4 bg-zinc-800 rounded w-32 mx-auto"></div>
      </div>

      {/* Blog grid skeleton */}
      <BlogGridSkeleton />
    </>
  )
}