"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Calendar, User, Clock, Home, Filter } from "lucide-react"

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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // filters (removed categoryFilter since we're using navigation instead)
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
      setBlogs((data || []) as Blog[])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to generate category slug
  const generateCategorySlug = (category: string) => {
    return category.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  // distinct, sorted category list with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>()
    blogs.forEach(b => {
      const label = (b.category || "").trim()
      if (label) map.set(label, (map.get(label) || 0) + 1)
    })
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }))
  }, [blogs])

  // filtered + sorted list (removed category filtering since we're showing all)
  const filteredBlogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    let arr = blogs.filter(blog => {
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
  }, [blogs, searchTerm, featuredFilter, sortBy])

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
    if (blog.category && blog.category.trim()) {
      const categorySlug = blog.category_slug || generateCategorySlug(blog.category)
      return `/blogs/${categorySlug}/${blog.slug}`
    }
    // Fallback for blogs without category - you might want to handle this differently
    return `/blogs/uncategorized/${blog.slug}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header with Home Button */}
      <div className="flex items-center justify-center md:justify-between flex-wrap gap-4">
        <SectionHeading title="Blog Posts" subtitle="Thoughts, tutorials, and insights" />
        <Link href="/">
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mt-8">
        {/* Search */}
        <div className="w-full lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search blog posts by title, excerpt, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <Select value="" onValueChange={(value) => {
            if (value === "all") {
              // Stay on current page (already showing all)
              return
            } else {
              // Navigate to category page
              const categorySlug = generateCategorySlug(value)
              window.location.href = `/blogs/${categorySlug}`
            }
          }}>
            <SelectTrigger className="w-44 bg-zinc-900/50 border-zinc-700 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Browse Categories" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-h-72">
              <SelectItem value="all">All Categories ({blogs.length})</SelectItem>
              {categories.map(({ label, count }) => (
                <SelectItem key={label} value={label}>
                  {label} ({count})
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
          {filteredBlogs.length !== blogs.length ? ` (from ${blogs.length} total)` : ""}
        </p>
      </div>

      {/* Blogs Grid */}
      {currentBlogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">No blog posts found.</p>
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
                  {/* Category + Tags */}
                  <div className="flex flex-wrap gap-2">
                    {blog.category ? (
                      <Badge variant="outline" className="text-xs">
                        {blog.category}
                      </Badge>
                    ) : null}
                    {(blog.tags || []).slice(0, 3).map((tag) => (
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