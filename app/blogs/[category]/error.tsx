// app/blogs/[category]/error.tsx
"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, ArrowLeft } from "lucide-react"

export default function CategoryError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const params = useParams()
    const categorySlug = params.category as string

    useEffect(() => {
        console.error("Category page error:", error)
    }, [error])

    return (
        <div className="text-center py-24">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong!</h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                We encountered an error while loading the "{categorySlug}" category. Please try again.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
                <Button
                    onClick={reset}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
                <Link href="/blogs">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        All Blogs
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        <Home className="h-4 w-4 mr-2" />
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}