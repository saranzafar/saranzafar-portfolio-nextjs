// app/blogs/[category]/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogHeader } from "@/components/blog/blog-header"
import { BlogFilters } from "@/components/blog/blog-filters"
import { BlogGrid } from "@/components/blog/blog-grid"
import { BlogGridSkeleton } from "@/components/blog/blog-skeleton"
import { useBlogs, useBlogFilters, usePagination, type Blog } from "@/hooks/use-blogs"

export default function CategoryPage() {
    const params = useParams()
    const categorySlug = params.category as string

    const { blogs, isLoading, error } = useBlogs()

    // Helper functions
    const generateCategorySlug = (category: string) => {
        return category.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const matchesCategorySlug = (blog: Blog, targetSlug: string) => {
        if (!blog.category) return false
        if (blog.category_slug && blog.category_slug === targetSlug) return true
        const generatedSlug = generateCategorySlug(blog.category)
        return generatedSlug === targetSlug
    }

    // Filter blogs for this specific category
    const categoryBlogs = useMemo(() => {
        if (isLoading || !blogs.length) return []
        return blogs.filter(blog => matchesCategorySlug(blog, categorySlug))
    }, [blogs, categorySlug, isLoading])

    // Get category name from the first matching blog
    const categoryName = useMemo(() => {
        const firstBlog = categoryBlogs[0]
        return firstBlog?.category || ""
    }, [categoryBlogs])

    // Check if category exists
    const categoryNotFound = !isLoading && blogs.length > 0 && categoryBlogs.length === 0

    // Use filters for the category-specific blogs
    const {
        searchTerm,
        setSearchTerm,
        featuredFilter,
        setFeaturedFilter,
        sortBy,
        setSortBy,
        categories,
        filteredBlogs
    } = useBlogFilters(categoryBlogs) // Pass categoryBlogs instead of all blogs

    // Get all categories for navigation (from all blogs)
    const allCategories = useMemo(() => {
        const map = new Map<string, { name: string, count: number, slug: string }>()
        blogs.forEach(blog => {
            const label = (blog.category || "").trim()
            if (label) {
                const slug = blog.category_slug || generateCategorySlug(label)
                const existing = map.get(label)
                if (existing) {
                    existing.count += 1
                } else {
                    map.set(label, { name: label, slug, count: 1 })
                }
            }
        })
        return Array.from(map.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({ name, count, slug }) => ({
                label: name,
                count,
                slug
            }))
    }, [blogs])

    // Get other categories for suggestions (exclude current)
    const otherCategories = useMemo(() => {
        return allCategories
            .filter(cat => cat.slug !== categorySlug)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }, [allCategories, categorySlug])

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

    // Error state
    if (error) {
        return (
            <div className="text-center py-24">
                <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Category</h1>
                <p className="text-zinc-400 mb-8">{error}</p>
                <div className="flex gap-4 justify-center">
                    <Link href="/blogs">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Blogs
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading) {
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

    // Category not found state
    if (categoryNotFound) {
        return (
            <div className="text-center py-24">
                <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    The category "{categorySlug}" doesn't exist or has no published posts.
                </p>

                {otherCategories.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Try these categories instead:</h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {otherCategories.map(({ label, slug, count }) => (
                                <Link key={slug} href={`/blogs/${slug}`}>
                                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                                        {label} ({count})
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <Link href="/blogs">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Blogs
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Main content
    return (
        <>
            <BlogHeader
                title={`${categoryName} Posts`}
                subtitle={`${categoryBlogs.length} ${categoryBlogs.length === 1 ? 'post' : 'posts'} in this category`}
                showBackButton={true}
                backButtonText="All Blogs"
                backButtonHref="/blogs"
            />

            <div className="mt-8">
                <BlogFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    featuredFilter={featuredFilter}
                    setFeaturedFilter={setFeaturedFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    categories={allCategories} // Use all categories for navigation
                    currentCategory={categoryName}
                    placeholder={`Search in ${categoryName}...`}
                />
            </div>

            {/* Results count */}
            <div className="mb-8">
                <p className="text-zinc-400 text-center">
                    {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"} found
                    {filteredBlogs.length !== categoryBlogs.length ?
                        ` (from ${categoryBlogs.length} total in ${categoryName})` :
                        ""
                    }
                </p>
            </div>

            {/* Blog grid */}
            <BlogGrid
                blogs={currentBlogs}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showCategory={false} // Don't show category badges since we're in a category page
                categorySlug={categorySlug}
                onClearSearch={handleClearSearch}
                onResetFilters={handleResetFilters}
                searchTerm={searchTerm}
                featuredFilter={featuredFilter}
            />
        </>
    )
}