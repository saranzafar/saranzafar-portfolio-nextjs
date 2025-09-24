import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { notFound } from "next/navigation"

// --- Blog type ---
type Blog = {
    slug: string
    title: string
    category: string | null
    author: string | null
    created_at: string | null
    updated_at: string | null
    published: boolean | null
}

// --- Supabase client ---
function supabaseServer() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(url, key, {
        auth: { persistSession: false },
    })
}

// --- Slugify helper ---
function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

// --- Fetch blogs for an author ---
async function getAuthorBlogs(author: string): Promise<Blog[]> {
    const supabase = supabaseServer()
    const { data, error } = await supabase
        .from("blogs")
        .select("slug, title, category, author, created_at, updated_at, published")
        .eq("published", true)
        .eq("author", author)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("[author page] fetch error:", error.message)
        return []
    }
    return data ?? []
}

export default async function AuthorPage(props: { params: Promise<{ author: string }> }) {
    const { author } = await props.params
    const slugifiedAuthor = decodeURIComponent(author)

    // Find the original author name in DB
    const supabase = supabaseServer()
    const { data: authors } = await supabase
        .from("blogs")
        .select("author")
        .eq("published", true)

    const allAuthors = Array.from(new Set(authors?.map((b) => b.author ?? "unknown")))
    const originalAuthor = allAuthors.find((a) => slugify(a) === slugifiedAuthor)

    if (!originalAuthor) {
        notFound()
    }

    const blogs = await getAuthorBlogs(originalAuthor!)

    if (!blogs.length) {
        notFound()
    }

    return (
        <section className="mx-auto max-w-4xl px-4 py-8">
            {/* Home link */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    ← Back to Home
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">
                Articles by {originalAuthor}
            </h1>

            <ul className="space-y-6">
                {blogs.map((blog) => (
                    <li key={blog.slug} className="border-b pb-4">
                        <Link
                            href={`/blogs/${slugify(blog.category ?? "general")}/${blog.slug}`}
                            className="text-xl font-semibold text-blue-600 hover:underline"
                        >
                            {blog.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(blog.updated_at ?? blog.created_at ?? "").toLocaleDateString()}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    )
}
