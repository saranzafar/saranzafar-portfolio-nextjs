"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Blog page error:", error)
    }, [error])

    return (
        <div className="text-center py-24">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong!</h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                We encountered an error while loading the blog posts. Please try again.
            </p>

            <div className="flex gap-4 justify-center">
                <Button
                    onClick={reset}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
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