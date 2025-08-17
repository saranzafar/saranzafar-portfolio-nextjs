import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

// Rebuild the sitemap at most once per hour (tweak as you like)
export const revalidate = 3600

type Row = {
    slug: string
    created_at?: string | null
    updated_at?: string | null
    published?: boolean | null
}

const baseUrl = "https://saranzafar.com"

// Create a server-side Supabase client
function supabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    // Prefer a server-only key if available; fall back to anon
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(url, key, {
        auth: { persistSession: false },
    })
}

async function fetchRows(table: string) {
    const supabase = supabaseServer()
    // Pull only what we need; rely on RLS: published = true
    const { data, error } = await supabase
        .from(table)
        .select("slug, created_at, updated_at, published")
        .eq("published", true)
        .limit(2000) // safety cap

    if (error) {
        console.error(`[sitemap] ${table} fetch error:`, error.message)
        return [] as Row[]
    }

    return (data ?? []) as Row[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [blogs, projects] = await Promise.all([fetchRows("blogs"), fetchRows("projects")])

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

    const blogEntries: MetadataRoute.Sitemap = blogs.map((b) => ({
        url: `${baseUrl}/blogs/${b.slug}`,
        lastModified: new Date(b.updated_at ?? b.created_at ?? new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
        url: `${baseUrl}/projects/${p.slug}`,
        lastModified: new Date(p.updated_at ?? p.created_at ?? new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    return [...staticEntries, ...blogEntries, ...projectEntries]
}
