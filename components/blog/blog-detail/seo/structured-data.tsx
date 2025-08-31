// components/seo/structured-data.tsx
interface BlogStructuredDataProps {
    blog: {
        title: string
        excerpt?: string | null
        content?: string | null
        author: string
        created_at: string
        updated_at?: string
        featured_image?: string | null
        category?: string | null
        tags?: string[] | null
    }
    url: string
    baseUrl: string
}

export function BlogStructuredData({ blog, url, baseUrl }: BlogStructuredDataProps) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt || blog.content?.substring(0, 160) + "..." || "",
        "image": blog.featured_image || `${baseUrl}/og-default.png`,
        "author": {
            "@type": "Person",
            "name": blog.author,
            "url": baseUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "Saran Zafar",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
            }
        },
        "datePublished": blog.created_at,
        "dateModified": blog.updated_at || blog.created_at,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        "articleSection": blog.category,
        "keywords": Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || blog.category || "",
        "inLanguage": "en-US",
        "url": url
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}

// components/seo/breadcrumb-structured-data.tsx
interface BreadcrumbStructuredDataProps {
    items: Array<{
        name: string
        url: string
    }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}

// lib/seo-utils.ts
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export function extractTextFromMarkdown(markdown: string, maxLength = 160): string {
    return markdown
        .replace(/[#*`]/g, '') // Remove markdown syntax
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
        .substring(0, maxLength)
        .trim() + (markdown.length > maxLength ? '...' : '')
}

export function generateKeywords(blog: {
    tags?: string[] | null
    category?: string | null
    title?: string
    content?: string | null
}): string {
    const keywords = []

    // Add tags
    if (Array.isArray(blog.tags) && blog.tags.length > 0) {
        keywords.push(...blog.tags)
    }

    // Add category
    if (blog.category) {
        keywords.push(blog.category)
    }

    // Extract keywords from title (basic approach)
    if (blog.title) {
        const titleWords = blog.title
            .toLowerCase()
            .split(' ')
            .filter(word => word.length > 3)
            .slice(0, 3)
        keywords.push(...titleWords)
    }

    return [...new Set(keywords)].join(', ')
}