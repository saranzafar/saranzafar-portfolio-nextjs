// hooks/use-blogs.ts
"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export type Blog = {
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

export function useBlogs() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        if (!isSupabaseConfigured) {
            setIsLoading(false)
            return
        }

        try {
            setError(null)
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false })

            if (error) throw error
            setBlogs((data || []) as Blog[])
        } catch (error) {
            console.error("Error fetching blogs:", error)
            setError("Failed to load blogs")
        } finally {
            setIsLoading(false)
        }
    }

    return { blogs, isLoading, error, refetch: fetchBlogs }
}

export function useBlogFilters(blogs: Blog[]) {
    const [searchTerm, setSearchTerm] = useState("")
    const [featuredFilter, setFeaturedFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("newest")

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

    // Get all categories with counts
    const categories = useMemo(() => {
        const map = new Map<string, number>()
        blogs.forEach(blog => {
            const label = (blog.category || "").trim()
            if (label) map.set(label, (map.get(label) || 0) + 1)
        })
        return Array.from(map.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([label, count]) => ({
                label,
                count,
                slug: generateCategorySlug(label)
            }))
    }, [blogs])

    // Apply search, featured, and sort filters to provided blogs
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
    }, [blogs, searchTerm, featuredFilter, sortBy])

    return {
        searchTerm,
        setSearchTerm,
        featuredFilter,
        setFeaturedFilter,
        sortBy,
        setSortBy,
        categories,
        filteredBlogs,
        generateCategorySlug,
        matchesCategorySlug
    }
}

export function usePagination(items: any[], itemsPerPage = 12) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    // Reset to page 1 when items change
    useEffect(() => {
        setCurrentPage(1)
    }, [items.length])

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        currentItems
    }
}