import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

// Revalidate sitemap every hour
export const revalidate = 3600
const baseUrl = "https://saranzafar.com"

type BlogRow = {
    slug: string
    category: string | null
    author: string | null
    created_at?: string | null
    updated_at?: string | null
    published?: boolean | null
}

type ProjectRow = {
    slug: string
    created_at?: string | null
    updated_at?: string | null
    published?: boolean | null
}

// --- Helper: Slugify (SEO-safe lowercase, hyphenated) ---
function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/-+/g, "-") // collapse multiple hyphens
}

// --- Supabase client ---
function supabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(url, key, { auth: { persistSession: false } })
}

async function fetchRows<T>(table: string, fields: string[]) {
    const supabase = supabaseServer()
    const { data, error } = await supabase
        .from(table)
        .select(fields.join(","))
        .eq("published", true)
        .limit(2000)

    if (error) {
        console.error(`[sitemap] ${table} fetch error:`, error.message)
        return [] as T[]
    }
    return (data ?? []) as T[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [blogs, projects] = await Promise.all([
        fetchRows<BlogRow>("blogs", [
            "slug",
            "category",
            "author",
            "created_at",
            "updated_at",
            "published",
        ]),
        fetchRows<ProjectRow>("projects", ["slug", "created_at", "updated_at", "published"]),
    ])

    // --- Static entries ---
    const staticEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
    ]

    // --- Categories ---
    const categories = Array.from(new Set(blogs.map((b) => b.category ?? "general")))

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => {
        const blogsInCategory = blogs.filter((b) => (b.category ?? "general") === cat)
        const latestBlog = blogsInCategory.reduce<Date>(
            (latest, b) =>
                new Date(b.updated_at ?? b.created_at ?? new Date()) > latest
                    ? new Date(b.updated_at ?? b.created_at ?? new Date())
                    : latest,
            new Date(0)
        )

        return {
            url: `${baseUrl}/blogs/${slugify(cat)}`,
            lastModified: latestBlog,
            changeFrequency: "weekly",
            priority: 0.75,
        }
    })

    // --- Authors ---
    const authors = Array.from(new Set(blogs.map((b) => b.author ?? "unknown")))

    const authorEntries: MetadataRoute.Sitemap = authors.map((author) => {
        const blogsByAuthor = blogs.filter((b) => (b.author ?? "unknown") === author)
        const latestBlog = blogsByAuthor.reduce<Date>(
            (latest, b) =>
                new Date(b.updated_at ?? b.created_at ?? new Date()) > latest
                    ? new Date(b.updated_at ?? b.created_at ?? new Date())
                    : latest,
            new Date(0)
        )

        return {
            url: `${baseUrl}/blogs/author/${slugify(author)}`,
            lastModified: latestBlog,
            changeFrequency: "weekly",
            priority: 0.7,
        }
    })

    // --- Individual blog posts ---
    const blogEntries: MetadataRoute.Sitemap = blogs.map((b) => ({
        url: `${baseUrl}/blogs/${slugify(b.category ?? "general")}/${b.slug}`,
        lastModified: new Date(b.updated_at ?? b.created_at ?? new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    // --- Projects ---
    const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: new Date(p.updated_at ?? p.created_at ?? new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    return [...staticEntries, ...categoryEntries, ...authorEntries, ...blogEntries, ...projectEntries]
}
