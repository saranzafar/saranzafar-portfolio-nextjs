import React from "react"

export default function BlogsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
            <div className="container p-4 md:py-32">
                {children}
            </div>
        </div>
    )
}