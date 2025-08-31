// app/blogs/[category]/[slug]/layout.tsx
import React from "react"

export default function BlogDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <article className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
            <div className="container py-16 md:py-24 lg:py-32">
                {children}
            </div>
        </article>
    )
}