"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Calendar, User, Clock, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/section-heading"
import { GlassmorphicCard } from "@/components/glassmorphic-card"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 6

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [blogs, searchTerm])

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
      setBlogs(data || [])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = blogs

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredBlogs(filtered)
    setCurrentPage(1)
  }

  const readingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(" ").length
    return Math.ceil(words / wordsPerMinute)
  }

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage)
  const startIndex = (currentPage - 1) * blogsPerPage
  const endIndex = startIndex + blogsPerPage
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <div className="container py-32">
        {/* Header with Home Button */}
        <div className="flex items-center justify-between mb-8">
          <SectionHeading title="Blog Posts" subtitle="Thoughts, tutorials, and insights" />
          <Link href="/">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mt-16 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-8">
          <p className="text-zinc-400 text-center">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"} found
          </p>
        </div>

        {/* Blogs Grid */}
        {currentBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">No blog posts found.</p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentBlogs.map((blog) => (
              <GlassmorphicCard key={blog.id}>
                <Link href={`/blogs/${blog.slug}`} className="block group">
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
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{blog.title}</h3>

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
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page ? "bg-purple-600 hover:bg-purple-700" : "border-zinc-700 hover:bg-zinc-800"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
