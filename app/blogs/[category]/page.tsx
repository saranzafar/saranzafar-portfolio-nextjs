"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { Search, Calendar, User, Clock, Home, ArrowLeft, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/section-heading"
import { GlassmorphicCard } from "@/components/glassmorphic-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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

export default function CategoryPage() {
    const params = useParams()
    const categorySlug = params.category as string

    const [blogs, setBlogs] = useState<Blog[]>([])
    const [categoryBlogs, setCategoryBlogs] = useState<Blog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [categoryName, setCategoryName] = useState<string>("")
    const [categoryNotFound, setCategoryNotFound] = useState(false)

    // filters
    const [searchTerm, setSearchTerm] = useState("")
    const [featuredFilter, setFeaturedFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("newest")

    // pagination
    const [currentPage, setCurrentPage] = useState(1)
    const BLOGS_PER_PAGE = 12

    useEffect(() => {
        fetchBlogs()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, featuredFilter, sortBy])

    // Helper function to generate category slug
    const generateCategorySlug = (category: string) => {
        return category.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim()
    }

    // Helper function to match category slug
    const matchesCategorySlug = (blog: Blog, targetSlug: string) => {
        if (!blog.category) return false

        // Check if category_slug matches
        if (blog.category_slug && blog.category_slug === targetSlug) {
            return true
        }

        // Fallback: generate slug from category name and compare
        const generatedSlug = generateCategorySlug(blog.category)
        return generatedSlug === targetSlug
    }

    const fetchBlogs = async () => {
        if (!isSupabaseConfigured) {
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false })

            if (error) throw error

            const allBlogs = (data || []) as Blog[]
            setBlogs(allBlogs)

            // Filter blogs for this category
            const filteredBlogs = allBlogs.filter(blog =>
                matchesCategorySlug(blog, categorySlug)
            )

            if (filteredBlogs.length === 0) {
                setCategoryNotFound(true)
            } else {
                setCategoryBlogs(filteredBlogs)
                // Set category name from the first matching blog
                setCategoryName(filteredBlogs[0].category || "")
            }
        } catch (error) {
            console.error("Error fetching blogs:", error)
            setCategoryNotFound(true)
        } finally {
            setIsLoading(false)
        }
    }

    // filtered + sorted list
    const filteredBlogs = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()

        let arr = categoryBlogs.filter(blog => {
            const matchesSearch =
                !q ||
                blog.title.toLowerCase().includes(q) ||
                (blog.excerpt?.toLowerCase().includes(q) ?? false) ||
                ((blog.tags || []).some(tag => tag?.toLowerCase().includes(q)))

            const matchesFeatured =
                featuredFilter === "all" ||
                (featuredFilter === "featured" && !!blog.featured) ||
                (featuredFilter === "regular" && !blog.featured)

            return matchesSearch && matchesFeatured
        })

        // sorting
        arr.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case "oldest":
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                case "title":
                    return a.title.localeCompare(b.title)
                case "author":
                    return a.author.localeCompare(b.author)
                default:
                    return 0
            }
        })

        return arr
    }, [categoryBlogs, searchTerm, featuredFilter, sortBy])

    // pagination
    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE))
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE
    const endIndex = startIndex + BLOGS_PER_PAGE
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex)

    const readingTime = (content?: string | null) => {
        if (!content) return 1
        const wordsPerMinute = 200
        const words = content.trim().split(/\s+/).length
        return Math.max(1, Math.ceil(words / wordsPerMinute))
    }

    const getBlogUrl = (blog: Blog) => {
        return `/blogs/${categorySlug}/${blog.slug}`
    }

    // Get other categories for suggestions
    const otherCategories = useMemo(() => {
        const map = new Map<string, { name: string, count: number, slug: string }>()
        blogs.forEach(blog => {
            if (blog.category && blog.category.trim() && !matchesCategorySlug(blog, categorySlug)) {
                const name = blog.category.trim()
                const slug = blog.category_slug || generateCategorySlug(name)
                const existing = map.get(name)
                if (existing) {
                    existing.count += 1
                } else {
                    map.set(name, { name, slug, count: 1 })
                }
            }
        })
        return Array.from(map.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }, [blogs, categorySlug])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p>Loading category...</p>
                </div>
            </div>
        )
    }

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
                            {otherCategories.map(({ name, slug, count }) => (
                                <Link key={slug} href={`/blogs/${slug}`}>
                                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                                        {name} ({count})
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

    return (
        <>
            {/* Header with Navigation */}
            <div className="flex items-center justify-center md:justify-between flex-wrap gap-4">
                <SectionHeading
                    title={`${categoryName} Posts`}
                    subtitle={`${categoryBlogs.length} ${categoryBlogs.length === 1 ? 'post' : 'posts'} in this category`}
                />
                <div className="flex gap-2">
                    <Link href="/blogs">
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Blogs
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mt-8">
                {/* Search */}
                <div className="w-full lg:max-w-lg">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder={`Search in ${categoryName}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3">
                    {/* Category Navigation Dropdown */}
                    <Select value="" onValueChange={(value) => {
                        if (value === "all") {
                            window.location.href = "/blogs"
                        } else {
                            const targetSlug = generateCategorySlug(value)
                            if (targetSlug !== categorySlug) {
                                window.location.href = `/blogs/${targetSlug}`
                            }
                        }
                    }}>
                        <SelectTrigger className="w-44 bg-zinc-900/50 border-zinc-700 text-white">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Switch Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-h-72">
                            <SelectItem value="all">All Categories ({blogs.length})</SelectItem>
                            {/* Show all categories including current one */}
                            {blogs.reduce((acc: Array<{ label: string, count: number }>, blog) => {
                                const label = (blog.category || "").trim()
                                if (label) {
                                    const existing = acc.find(cat => cat.label === label)
                                    if (existing) {
                                        existing.count += 1
                                    } else {
                                        acc.push({ label, count: 1 })
                                    }
                                }
                                return acc
                            }, [])
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map(({ label, count }) => (
                                    <SelectItem
                                        key={label}
                                        value={label}
                                        className={label === categoryName ? "bg-purple-600/20" : ""}
                                    >
                                        {label} ({count}) {label === categoryName && "• Current"}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    {/* Featured */}
                    <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                        <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-700 text-white">
                            <SelectValue placeholder="Featured" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-700 text-white">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="title">Title A–Z</SelectItem>
                            <SelectItem value="author">Author A–Z</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results count */}
            <div className="mb-8">
                <p className="text-zinc-400 text-center">
                    {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"} found
                    {filteredBlogs.length !== categoryBlogs.length ? ` (from ${categoryBlogs.length} total in ${categoryName})` : ""}
                </p>
            </div>

            {/* Blogs Grid */}
            {currentBlogs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">No blog posts found in this category.</p>
                    {(searchTerm || featuredFilter !== "all") && (
                        <div className="flex gap-2 justify-center">
                            <Button
                                onClick={() => setSearchTerm("")}
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                Clear Search
                            </Button>
                            {featuredFilter !== "all" && (
                                <Button
                                    onClick={() => {
                                        setFeaturedFilter("all")
                                        setSortBy("newest")
                                    }}
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800"
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentBlogs.map((blog) => (
                        <GlassmorphicCard key={blog.id}>
                            <Link href={getBlogUrl(blog)} className="block group">
                                {blog.featured_image && (
                                    <div className="relative overflow-hidden rounded-lg mb-4">
                                        <img
                                            src={blog.featured_image || "/placeholder.svg"}
                                            alt={blog.title}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Tags (Category is implicit from the page) */}
                                    <div className="flex flex-wrap gap-2">
                                        {(blog.tags || []).slice(0, 4).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">
                                        {blog.title}
                                    </h3>

                                    {blog.excerpt && <p className="text-zinc-400 line-clamp-3">{blog.excerpt}</p>}

                                    <div className="flex items-center justify-between text-sm text-zinc-500 pt-4 border-t border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                <span>{blog.author}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{readingTime(blog.content)} min read</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </GlassmorphicCard>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredBlogs.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-zinc-700 hover:bg-zinc-800"
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                            .map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    onClick={() => setCurrentPage(page)}
                                    className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700 hover:bg-zinc-800"}
                                >
                                    {page}
                                </Button>
                            ))}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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