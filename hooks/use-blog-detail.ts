// hooks/use-blog-detail.ts
"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export type BlogDetail = {
    id: string
    title: string
    slug: string
    author: string
    created_at: string
    updated_at?: string
    excerpt?: string | null
    content?: string | null
    tags: string[] | null
    featured_image?: string | null
    published: boolean
    category?: string | null
    category_slug?: string | null
    featured?: boolean | null
    meta_description?: string | null
    keywords?: string[] | null
}

export function useBlogDetail(slug: string) {
    const [blog, setBlog] = useState<BlogDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const fetchBlog = async () => {
            if (!isSupabaseConfigured || !slug) {
                setIsLoading(false)
                setNotFound(true)
                return
            }

            try {
                setError(null)
                setNotFound(false)

                const { data, error } = await supabase
                    .from("blogs")
                    .select("*")
                    .eq("slug", slug)
                    .eq("published", true)
                    .single()

                if (error) {
                    if (error.code === 'PGRST116') {
                        setNotFound(true)
                    } else {
                        throw error
                    }
                    return
                }

                setBlog(data as BlogDetail)
            } catch (err) {
                console.error("Error fetching blog:", err)
                setError("Failed to load blog post")
            } finally {
                setIsLoading(false)
            }
        }

        fetchBlog()
    }, [slug])

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

    return {
        blog,
        isLoading,
        error,
        notFound,
        readingTime,
        generateCategorySlug
    }
}