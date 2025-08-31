
// app/blogs/[category]/[slug]/error.tsx
"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, ArrowLeft } from "lucide-react"

export default function BlogDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const params = useParams()
    const { category, slug } = params

    useEffect(() => {
        console.error("Blog detail error:", error)
    }, [error])

    return (
        <div className="max-w-4xl mx-auto text-center py-24">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong!</h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                We encountered an error while loading the blog post "{slug}". Please try again.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
                <Button
                    onClick={reset}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>

                <Link href={`/blogs/${category}`}>
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to {category}
                    </Button>
                </Link>

                <Link href="/blogs">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        All Blogs
                    </Button>
                </Link>

                <Link href="/">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}