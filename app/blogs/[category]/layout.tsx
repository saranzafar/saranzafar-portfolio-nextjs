// app/blogs/[category]/layout.tsx
import React from "react"

export default function CategoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}