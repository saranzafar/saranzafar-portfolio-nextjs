"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
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

interface Blog {
    id: string
    title: string
    content: string
    excerpt?: string
    author: string
    created_at: string
    featured_image?: string
    tags?: string[]
    slug: string
    published: boolean
}

export default function ClientBlogDetailPage({ params }: BlogDetailPageProps) {
    const [blog, setBlog] = useState<Blog | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const { slug } = params

    // Update document title based on blog state
    useEffect(() => {
        if (blog) {
            // Successfully loaded blog - set title to blog title
            document.title = `${blog.title} | Saran Zafar`
        } else if (error === "Blog post not found") {
            // Blog not found - set appropriate title
            document.title = "Blog Post Not Found | Saran Zafar"
        } else if (error) {
            // Other error - set error title
            document.title = "Error Loading Blog | Saran Zafar"
        } else if (isLoading) {
            // Still loading - set loading title
            document.title = "Loading Blog Post... | Saran Zafar"
        }
    }, [blog, error, isLoading])

    useEffect(() => {
        const fetchBlog = async (blogSlug: string) => {
            if (!isSupabaseConfigured) {
                setError("Blog service is not configured")
                setIsLoading(false)
                return
            }

            try {
                setError(null)
                const { data, error } = await supabase
                    .from("blogs")
                    .select("*")
                    .eq("slug", blogSlug)
                    .eq("published", true)
                    .single()

                if (error) {
                    if (error.code === 'PGRST116') {
                        setError("Blog post not found")
                    } else {
                        setError("Failed to load blog post")
                    }
                    throw error
                }

                setBlog(data)
            } catch (err) {
                console.error("Error fetching blog:", err)
            } finally {
                setIsLoading(false)
            }
        }

        if (slug) {
            fetchBlog(slug)
        }
    }, [slug])

    const readingTime = (content: string): number => {
        const wordsPerMinute = 200
        const words = content?.trim().split(/\s+/).length || 0
        return Math.max(1, Math.ceil(words / wordsPerMinute))
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : ""

    const handleCopyLink = async () => {
        if (!currentUrl) return

        try {
            await navigator.clipboard.writeText(currentUrl)
            toast({
                title: "Link copied!",
                description: "You can now share it anywhere."
            })
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try again.",
                variant: "destructive"
            })
        }
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog?.title ?? "")}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${blog?.title ?? ""} ${currentUrl}`)}`,
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading blog post...</p>
                </div>
            </div>
        )
    }

    // Error or Not found state
    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <h1 className="text-2xl font-bold mb-4">
                        {error === "Blog post not found" ? "Blog Not Found" : "Something Went Wrong"}
                    </h1>
                    <p className="text-zinc-400 mb-6">
                        {error === "Blog post not found"
                            ? "The blog you're looking for doesn't exist or has been removed."
                            : error || "Unable to load the blog post. Please try again later."
                        }
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/blogs">
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500">
                                Back to Blogs
                            </Button>
                        </Link>
                        {error && error !== "Blog post not found" && (
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Dynamic Head Meta Tags */}
            <Head>
                <title>{blog.title} | Saran Zafar</title>
                <meta name="description" content={blog.excerpt || `Read ${blog.title} by ${blog.author}`} />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={blog.excerpt || `Read ${blog.title} by ${blog.author}`} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                {blog.featured_image && <meta property="og:image" content={blog.featured_image} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blog.title} />
                <meta name="twitter:description" content={blog.excerpt || `Read ${blog.title} by ${blog.author}`} />
                {blog.featured_image && <meta name="twitter:image" content={blog.featured_image} />}
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
                <div className="">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link href="/blogs">
                            <Button
                                variant="ghost"
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Blogs
                            </Button>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="max-w-5xl mx-auto">
                        {/* Featured Image */}
                        {blog.featured_image && (
                            <div className="relative overflow-hidden rounded-xl mb-8 group">
                                <img
                                    src={blog.featured_image}
                                    alt={blog.title}
                                    className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Excerpt */}
                        {blog.excerpt && (
                            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                                {blog.excerpt}
                            </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={blog.created_at}>
                                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Clock className="h-4 w-4" />
                                <span>{readingTime(blog.content)} min read</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                            <div className="flex items-start gap-3 mb-8">
                                <Tag className="h-4 w-4 text-zinc-500 mt-1 flex-shrink-0" />
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="text-xs hover:bg-zinc-700 transition-colors cursor-default"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Article Content */}
                        <article className="prose prose-invert prose-lg max-w-none">
                            <div
                                className="markdown-content"
                                data-color-mode="dark"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "inherit",
                                    fontFamily: "inherit"
                                }}
                            >
                                <MDEditor.Markdown
                                    source={blog.content}
                                    style={{
                                        backgroundColor: "transparent",
                                        color: "inherit",
                                        fontFamily: "inherit"
                                    }}
                                    data-color-mode="dark"
                                />
                            </div>
                        </article>

                        {/* Share Section */}
                        <div className="mt-12 border-t border-zinc-800 pt-8">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Share2 className="h-4 w-4" />
                                Share this post
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Link
                                </Button>
                                <Link href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2">
                                        <Twitter className="h-4 w-4" />
                                        Twitter
                                    </Button>
                                </Link>
                                <Link href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </Button>
                                </Link>
                                <Link href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2">
                                        <Facebook className="h-4 w-4" />
                                        Facebook
                                    </Button>
                                </Link>
                                <Link href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2">
                                        <MessageCircleReply className="h-4 w-4" />
                                        WhatsApp
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}