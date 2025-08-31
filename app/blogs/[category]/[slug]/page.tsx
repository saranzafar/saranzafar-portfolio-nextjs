import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import ClientBlogDetailPage from "./ClientBlogDetailPage"

const baseUrl = "https://saranzafar.com"

type ParamsPromise = Promise<{ slug: string }>

// Server-side Supabase client for metadata
function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function generateMetadata(
  { params }: { params: ParamsPromise }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = supabaseServer()

  const { data: blog } = await supabase
    .from("blogs")
    .select("title, excerpt, content, featured_image, created_at, updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!blog) {
    return {
      title: "Blog Not Found | Saran Zafar",
      description: "The blog you’re looking for does not exist.",
      alternates: { canonical: `${baseUrl}/blogs/${slug}` },
    }
  }

  const url = `${baseUrl}/blogs/${slug}`
  const description =
    blog.excerpt ||
    (blog.content ? blog.content.substring(0, 160) + "..." : "Read this article on Saran Zafar's blog.")

  return {
    title: `${blog.title} | Saran Zafar`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: blog.title,
      description,
      url,
      type: "article",
      siteName: "Saran Zafar Blog",
      publishedTime: blog.created_at ?? undefined,
      modifiedTime: blog.updated_at ?? undefined,
      images: blog.featured_image
        ? [{ url: blog.featured_image, width: 1200, height: 630, alt: blog.title }]
        : [{ url: `${baseUrl}/og.png`, width: 1200, height: 630, alt: "Saran Zafar Blog" }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.featured_image ? [blog.featured_image] : [`${baseUrl}/og.png`],
    },
  }
}

export default async function Page(
  { params }: { params: ParamsPromise }
) {
  const resolved = await params
  return <ClientBlogDetailPage params={resolved} />
}
