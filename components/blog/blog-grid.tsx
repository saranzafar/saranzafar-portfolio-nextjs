// components/blog-grid.tsx
import { Button } from "@/components/ui/button"
import { BlogCard } from "@/components/blog/blog-card"

type Blog = {
    id: string
    title: string
    slug: string
    author: string
    created_at: string
    excerpt?: string | null
    content?: string | null
    tags: string[] | null
    featured_image?: string | null
    published: boolean
    category?: string | null
    category_slug?: string | null
    featured?: boolean | null
}

interface BlogGridProps {
    blogs: Blog[]
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showCategory?: boolean
    categorySlug?: string
    onClearSearch?: () => void
    onResetFilters?: () => void
    searchTerm?: string
    featuredFilter?: string
}

export function BlogGrid({
    blogs,
    currentPage,
    totalPages,
    onPageChange,
    showCategory = true,
    categorySlug,
    onClearSearch,
    onResetFilters,
    searchTerm,
    featuredFilter
}: BlogGridProps) {
    if (blogs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">No blog posts found.</p>
                {(searchTerm || featuredFilter !== "all") && (
                    <div className="flex gap-2 justify-center">
                        {onClearSearch && (
                            <Button
                                onClick={onClearSearch}
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                Clear Search
                            </Button>
                        )}
                        {onResetFilters && featuredFilter !== "all" && (
                            <Button
                                onClick={onResetFilters}
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={blog}
                        showCategory={showCategory}
                        categorySlug={categorySlug}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-zinc-700 hover:bg-zinc-800"
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                            )
                            .map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    onClick={() => onPageChange(page)}
                                    className={
                                        currentPage === page
                                            ? "bg-purple-600 hover:bg-purple-700"
                                            : "border-zinc-700 hover:bg-zinc-800"
                                    }
                                >
                                    {page}
                                </Button>
                            ))}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-zinc-700 hover:bg-zinc-800"
                    >
                        Next
                    </Button>
                </div>
            )}
        </>
    )
}