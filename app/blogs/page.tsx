"use client"

import { useEffect } from "react"
import { BlogHeader } from "@/components/blog/blog-header"
import { BlogFilters } from "@/components/blog/blog-filters"
import { BlogGrid } from "@/components/blog/blog-grid"
import { BlogGridSkeleton } from "@/components/blog/blog-skeleton"
import { useBlogs, useBlogFilters, usePagination } from "@/hooks/use-blogs"

export default function BlogsPage() {
  const { blogs, isLoading, error } = useBlogs()
  const {
    searchTerm,
    setSearchTerm,
    featuredFilter,
    setFeaturedFilter,
    sortBy,
    setSortBy,
    categories,
    filteredBlogs
  } = useBlogFilters(blogs)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    currentItems: currentBlogs
  } = usePagination(filteredBlogs, 12)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, featuredFilter, sortBy, setCurrentPage])

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const handleResetFilters = () => {
    setFeaturedFilter("all")
    setSortBy("newest")
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Blogs</h1>
        <p className="text-zinc-400">{error}</p>
      </div>
    )
  }

  return (
    <>
      <BlogHeader
        title="Blog Posts"
        subtitle="Thoughts, tutorials, and insights"
      />

      <div className="mt-8">
        <BlogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          featuredFilter={featuredFilter}
          setFeaturedFilter={setFeaturedFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />
      </div>

      {/* Results count */}
      <div className="mb-8">
        <p className="text-zinc-400 text-center">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"} found
              {filteredBlogs.length !== blogs.length ? ` (from ${blogs.length} total)` : ""}
            </>
          )}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <BlogGridSkeleton />
      ) : (
        <BlogGrid
          blogs={currentBlogs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showCategory={true}
          onClearSearch={handleClearSearch}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          featuredFilter={featuredFilter}
        />
      )}
    </>
  )
}