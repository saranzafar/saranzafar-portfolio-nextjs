// app/blogs/[category]/[slug]/not-found.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function BlogNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
            <div className="max-w-md text-center px-6">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-purple-400 mb-4">404</h1>
                    <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
                    <p className="text-zinc-400 leading-relaxed">
                        The blog post you're looking for doesn't exist, has been moved, or is no longer available.
                    </p>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                    <Link href="/blogs">
                        <Button className="bg-purple-600 hover:bg-purple-700">
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
        </div>
    )
}