"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"

interface BlogHeaderProps {
    title: string
    subtitle: string
    showBackButton?: boolean
    backButtonText?: string
    backButtonHref?: string
}

export function BlogHeader({
    title,
    subtitle,
    showBackButton = false,
    backButtonText = "All Blogs",
    backButtonHref = "/blogs"
}: BlogHeaderProps) {
    return (
        <div className="flex items-center justify-center md:justify-between flex-wrap gap-4">
            <SectionHeading title={title} subtitle={subtitle} />
            <div className="flex gap-2">
                {showBackButton && (
                    <Link href={backButtonHref}>
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {backButtonText}
                        </Button>
                    </Link>
                )}
                <Link href="/">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                        <Home className="h-4 w-4 mr-2" />
                        {showBackButton ? "Home" : "Go Home"}
                    </Button>
                </Link>
            </div>
        </div>
    )
}