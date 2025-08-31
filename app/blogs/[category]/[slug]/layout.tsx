// app/blogs/[category]/[slug]/layout.tsx
import React from "react"

export default function BlogDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <article className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
            <div className="">
                {children}
            </div>
        </article>
    )
}