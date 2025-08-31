// components/blog-card.tsx
import Link from "next/link"
import { Calendar, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassmorphicCard } from "@/components/glassmorphic-card"

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

interface BlogCardProps {
    blog: Blog
    showCategory?: boolean
    categorySlug?: string
}

export function BlogCard({ blog, showCategory = true, categorySlug }: BlogCardProps) {
    const readingTime = (content?: string | null) => {
        if (!content) return 1
        const wordsPerMinute = 200
        const words = content.trim().split(/\s+/).length
        return Math.max(1, Math.ceil(words / wordsPerMinute))
    }

    const generateCategorySlug = (category: string) => {
        return category.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const getBlogUrl = (blog: Blog) => {
        if (categorySlug) {
            return `/blogs/${categorySlug}/${blog.slug}`
        }

        if (blog.category && blog.category.trim()) {
            const slug = blog.category_slug || generateCategorySlug(blog.category)
            return `/blogs/${slug}/${blog.slug}`
        }

        return `/blogs/uncategorized/${blog.slug}`
    }

    return (
        <GlassmorphicCard>
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
                        {showCategory && blog.category && (
                            <Badge variant="outline" className="text-xs">
                                {blog.category}
                            </Badge>
                        )}
                        {(blog.tags || []).slice(0, showCategory ? 3 : 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">
                        {blog.title}
                    </h3>

                    {blog.excerpt && (
                        <p className="text-zinc-400 line-clamp-3">{blog.excerpt}</p>
                    )}

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
    )
}