// components/blog-filters.tsx
"use client"

import { useRouter } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Category = {
    label: string
    count: number
    slug: string
}

interface BlogFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    featuredFilter: string
    setFeaturedFilter: (filter: string) => void
    sortBy: string
    setSortBy: (sort: string) => void
    categories: Category[]
    currentCategory?: string
    placeholder?: string
}

export function BlogFilters({
    searchTerm,
    setSearchTerm,
    featuredFilter,
    setFeaturedFilter,
    sortBy,
    setSortBy,
    categories,
    currentCategory,
    placeholder = "Search blog posts by title, excerpt, or tag..."
}: BlogFiltersProps) {
    const router = useRouter()

    const generateCategorySlug = (category: string) => {
        return category.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const handleCategoryChange = (value: string) => {
        if (value === "all") {
            router.push("/blogs")
        } else {
            const targetSlug = generateCategorySlug(value)
            router.push(`/blogs/${targetSlug}`)
        }
    }

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
                {/* Category */}
                <Select value="" onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-44 bg-zinc-900/50 border-zinc-700 text-white">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={currentCategory ? "Switch Category" : "Browse Categories"} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-h-72">
                        <SelectItem value="all">
                            All Categories ({categories.reduce((sum, cat) => sum + cat.count, 0)})
                        </SelectItem>
                        {categories.map(({ label, count }) => (
                            <SelectItem
                                key={label}
                                value={label}
                                className={label === currentCategory ? "bg-purple-600/20" : ""}
                            >
                                {label} ({count}) {label === currentCategory && "• Current"}
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
    )
}