"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, User, Search, Filter, MoreVertical, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

type Blog = {
  id: string
  title: string
  excerpt?: string
  author: string
  created_at: string
  published: boolean
  tags: string[] | null
  featured_image?: string
  slug?: string
  // NEW (already in DB per your create/edit pages)
  category?: string | null
  category_slug?: string | null
  featured?: boolean | null
}

export default function AdminBlogsPage() {
  const { toast } = useToast()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // existing filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // NEW filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = useState<string>("all") // all | featured | regular

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    // whenever any filter/sort/search changes, reset to first page
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sortBy, categoryFilter, featuredFilter])

  const fetchBlogs = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setBlogs((data || []) as Blog[])
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Build category list from blogs (distinct, sorted)
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

  // Filtering + sorting (memoized)
  const filteredBlogs = useMemo(() => {
    let arr = blogs.filter((blog) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        (blog.excerpt?.toLowerCase().includes(q) ?? false) ||
        blog.author.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && blog.published) ||
        (statusFilter === "draft" && !blog.published)

      const matchesCategory =
        categoryFilter === "all" ||
        (blog.category && blog.category.trim() === categoryFilter)

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && !!blog.featured) ||
        (featuredFilter === "regular" && !blog.featured)

      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured
    })

    // Sort
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
  }, [blogs, searchTerm, statusFilter, sortBy, categoryFilter, featuredFilter])

  // Pagination slices
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageEnd = pageStart + PAGE_SIZE
  const pageBlogs = filteredBlogs.slice(pageStart, pageEnd)

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("blogs").update({ published: !currentStatus }).eq("id", id)
      if (error) throw error
      setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, published: !currentStatus } : blog)))
      toast({
        title: "Success",
        description: `Blog ${!currentStatus ? "published" : "unpublished"} successfully`,
      })
    } catch (error) {
      console.error("Error updating blog:", error)
      toast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      })
    }
  }

  const deleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id)
      if (error) throw error
      setBlogs(blogs.filter((blog) => blog.id !== id))
      toast({ title: "Success", description: "Blog deleted successfully" })
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      })
    }
  }

  const getBlogStats = () => {
    const published = blogs.filter(blog => blog.published).length
    const drafts = blogs.filter(blog => !blog.published).length
    return { total: blogs.length, published, drafts }
  }

  const stats = getBlogStats()

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-zinc-300">Loading blogs...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8 max-w-7xl mx-auto">
          <AdminHeader title="Manage Blogs" description="Create, edit, and manage your blog posts" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Total Posts</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Published</p>
                    <p className="text-2xl font-bold text-green-400">{stats.published}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.drafts}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search blogs by title, excerpt, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Status filter (existing) */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-zinc-800/50 border-zinc-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>

                {/* NEW: Category filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-h-72">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(({ label, count }) => (
                      <SelectItem key={label} value={label}>
                        {label} ({count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* NEW: Featured filter */}
                <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                  <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort (existing) */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="author">Author A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add New Blog Button */}
            <Link href="/admin/upload-blog">
              <Button className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                New Blog Post
              </Button>
            </Link>
          </div>

          {/* Blogs List */}
          {filteredBlogs.length === 0 ? (
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="text-zinc-400 mb-4">
                  {blogs.length === 0 ? "No blog posts found" : "No blogs match your filters"}
                </div>
                {blogs.length === 0 && (
                  <Link href="/admin/upload-blog">
                    <Button>Create Your First Blog Post</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1">
              {pageBlogs?.map((blog) => (
                <Card
                  key={blog.id}
                  className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-200"
                >
                  <CardHeader>
                    {/* Stack on mobile; original side-by-side on sm+ */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left */}
                      <div className="flex-1 min-w-0">
                        {/* Title row wraps nicely on small screens */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <CardTitle className="text-xl text-zinc-100 truncate">{blog.title}</CardTitle>
                          <Badge variant={blog.published ? "default" : "secondary"} className="shrink-0">
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                          {blog.featured ? (
                            <Badge className="shrink-0 gap-1 bg-purple-600 hover:bg-purple-600">
                              <Star className="h-3 w-3" /> Featured
                            </Badge>
                          ) : null}
                          {blog.category ? (
                            <Badge variant="outline" className="shrink-0 border-zinc-600 text-zinc-300">
                              {blog.category}
                            </Badge>
                          ) : null}
                        </div>

                        {/* Excerpt: allow wrapping on small screens */}
                        <CardDescription className="text-zinc-400 line-clamp-2 break-words">
                          {blog.excerpt || "No excerpt available"}
                        </CardDescription>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                                {tag}
                              </Badge>
                            ))}
                            {blog.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                                +{blog.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Meta info: allow wrapping on small screens */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{blog.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right (image): full width on mobile, original size on sm+ */}
                      {blog.featured_image && (
                        <div className="ml-0 sm:ml-4 shrink-0">
                          <img
                            src={blog.featured_image || "/placeholder.svg"}
                            alt={blog.title}
                            className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Actions: allow wrapping and keep spacing tight on mobile */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/edit-blog/${blog.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(blog.id, blog.published)}
                      >
                        {blog.published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </Button>

                      {blog.published && blog.slug && (
                        <Link href={`/blogs/${blog.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuItem
                            onClick={() => deleteBlog(blog.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {filteredBlogs.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-zinc-400">
                    Showing {pageStart + 1}–{Math.min(pageEnd, filteredBlogs.length)} of {filteredBlogs.length} filtered posts
                    {filteredBlogs.length !== blogs.length ? ` (total ${blogs.length})` : ""}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="border-zinc-700"
                    >
                      Prev
                    </Button>

                    {/* Simple numbered pages (compact) */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1
                      const active = pageNum === currentPage
                      // compact window around current page
                      const show =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1

                      if (!show) return null
                      return (
                        <Button
                          key={pageNum}
                          variant={active ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={active ? "" : "border-zinc-700"}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="border-zinc-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Info (kept, but now handled above with pagination) */}
              {filteredBlogs.length > 0 && totalPages === 1 && (
                <div className="mt-6 text-center text-sm text-zinc-400">
                  Showing {filteredBlogs.length} of {blogs.length} blog posts
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
