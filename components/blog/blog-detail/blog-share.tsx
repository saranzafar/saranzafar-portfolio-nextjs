// components/blog-detail/blog-share.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Copy, Share2, Twitter, Linkedin, Facebook,
    MessageCircleReply, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface BlogShareProps {
    title: string
    url: string
}

export function BlogShare({ title, url }: BlogShareProps) {
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast({
                title: "Link copied!",
                description: "You can now share it anywhere.",
                duration: 2000
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast({
                title: "Failed to copy",
                description: "Please try again.",
                variant: "destructive"
            })
        }
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
    }

    return (
        <div className="mt-12 border-t border-zinc-800 pt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share this post
            </h3>
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-zinc-700 hover:bg-zinc-800 flex items-center gap-2"
                    disabled={copied}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                </Button>

                <Link href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2">
                        <Twitter className="h-4 w-4" /> Twitter
                    </Button>
                </Link>

                <Link href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                    </Button>
                </Link>

                <Link href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2">
                        <Facebook className="h-4 w-4" /> Facebook
                    </Button>
                </Link>

                <Link href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-green-600 hover:green-700 flex items-center gap-2">
                        <MessageCircleReply className="h-4 w-4" /> WhatsApp
                    </Button>
                </Link>
            </div>
        </div>
    )
}