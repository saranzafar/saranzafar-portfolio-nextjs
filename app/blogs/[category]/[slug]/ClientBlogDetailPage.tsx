"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    ArrowLeft, Calendar, User, Clock, Tag, Copy, Share2,
    Twitter, Linkedin, Facebook, MessageCircleReply
} from "lucide-react"
import MDEditor from "@uiw/react-md-editor"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface BlogDetailPageProps {
    params: { slug: string }
}

export default function ClientBlogDetailPage({ params }: BlogDetailPageProps) {
    const [blog, setBlog] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const slug = params.slug

    useEffect(() => {
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
            } catch (err) {
                console.error("Error fetching blog:", err)
            } finally {
                setIsLoading(false)
            }
        }

        if (slug) fetchBlog(slug)
    }, [slug])

    const readingTime = (content: string) => {
        const wordsPerMinute = 200
        const words = content?.split(" ").length || 0
        return Math.ceil(words / wordsPerMinute)
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : ""

    const handleCopy = () => {
        if (!currentUrl) return
        navigator.clipboard.writeText(currentUrl)
        toast({ title: "Link copied!", description: "You can now share it anywhere." })
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog?.title ?? "")}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent((blog?.title ?? "") + " " + currentUrl)}`,
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
                    <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
                    <p className="text-zinc-400 mb-6">The blog you’re looking for doesn’t exist or has been removed.</p>
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

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Featured Image */}
                    {blog.featured_image && (
                        <div className="relative overflow-hidden rounded-xl mb-8">
                            <img
                                src={blog.featured_image || "/placeholder.svg"}
                                alt={blog.title}
                                className="w-full h-64 md:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                        {blog.title}
                    </h1>

                    {/* Excerpt */}
                    {blog.excerpt && <p className="text-xl text-zinc-400 mb-8">{blog.excerpt}</p>}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <User className="h-4 w-4" /> <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Clock className="h-4 w-4" /> <span>{readingTime(blog.content)} min read</span>
                        </div>
                    </div>

                    {/* Tags */}
                    {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-8">
                            <Tag className="h-4 w-4 text-zinc-500" />
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((t: string) => (
                                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="prose prose-invert prose-lg max-w-none">
                        <MDEditor.Markdown
                            source={blog.content}
                            style={{ backgroundColor: "transparent", color: "inherit" }}
                        />
                    </div>

                    {/* Share */}
                    <div className="mt-12 border-t border-zinc-800 pt-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Share2 className="h-4 w-4" /> Share this post
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={handleCopy} variant="outline" className="border-zinc-700 hover:bg-zinc-800 flex items-center gap-2">
                                <Copy className="h-4 w-4" /> Copy
                            </Button>
                            <Link href={shareLinks.twitter} target="_blank">
                                <Button className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2">
                                    <Twitter className="h-4 w-4" /> Twitter
                                </Button>
                            </Link>
                            <Link href={shareLinks.linkedin} target="_blank">
                                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" /> LinkedIn
                                </Button>
                            </Link>
                            <Link href={shareLinks.facebook} target="_blank">
                                <Button className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2">
                                    <Facebook className="h-4 w-4" /> Facebook
                                </Button>
                            </Link>
                            <Link href={shareLinks.whatsapp} target="_blank">
                                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                                    <MessageCircleReply className="h-4 w-4" /> WhatsApp
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
