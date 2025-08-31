
// components/blog-detail/blog-navigation.tsx
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogNavigationProps {
    categoryName?: string
    categorySlug?: string
}

export function BlogNavigation({ categoryName, categorySlug }: BlogNavigationProps) {
    return (
        <div className="mb-8 flex flex-wrap gap-3">
            <Link href="/">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                </Button>
            </Link>

            <Link href="/blogs">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    All Blogs
                </Button>
            </Link>

            {categoryName && categorySlug && (
                <Link href={`/blogs/${categorySlug}`}>
                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        {categoryName}
                    </Button>
                </Link>
            )}

            <div className="text-zinc-600 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
            </div>
        </div>
    )
}