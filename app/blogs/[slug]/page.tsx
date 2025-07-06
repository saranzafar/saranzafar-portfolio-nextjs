"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [blog, setBlog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [slug, setSlug] = useState<string>("")

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      fetchBlog(resolvedParams.slug)
    }
    getParams()
  }, [params])

  const fetchBlog = async (blogSlug: string) => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", blogSlug)
        .eq("published", true)
        .single()

      if (error) throw error
      setBlog(data)
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const readingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(" ").length
    return Math.ceil(words / wordsPerMinute)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-zinc-400 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/blogs">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <div className="container py-32">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>

        {/* Blog Header */}
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {blog.featured_image && (
            <div className="relative overflow-hidden rounded-xl mb-8">
              <img
                src={blog.featured_image || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && <p className="text-xl text-zinc-400 mb-8">{blog.excerpt}</p>}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400">
              <User className="h-4 w-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-4 w-4" />
              <span>{readingTime(blog.content)} min read</span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <Tag className="h-4 w-4 text-zinc-500" />
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-purple-400 prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-zinc-900 prose-blockquote:border-purple-500"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-zinc-400">
                <p>Published on {new Date(blog.created_at).toLocaleDateString()}</p>
                {blog.updated_at !== blog.created_at && (
                  <p className="text-sm">Last updated on {new Date(blog.updated_at).toLocaleDateString()}</p>
                )}
              </div>
              <Link href="/blogs">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                  Read More Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
