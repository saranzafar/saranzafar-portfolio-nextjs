// app/blogs/[category]/[slug]/page.tsx
import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import ClientBlogDetailPage from "./ClientBlogDetailPage"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saranzafar.com"

type ParamsPromise = Promise<{ slug: string; category: string }>

// Server-side Supabase client for metadata
function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: 'public' }
  })
}

// Generate static params for better SEO and performance
export async function generateStaticParams() {
  const supabase = supabaseServer()

  try {
    const { data: blogs } = await supabase
      .from("blogs")
      .select("slug, category, category_slug")
      .eq("published", true)
      .limit(100) // Adjust based on your needs

    if (!blogs) return []

    return blogs
      .filter(blog => blog.category && blog.slug)
      .map((blog) => {
        const categorySlug = blog.category_slug ||
          blog.category!.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()

        return {
          category: categorySlug,
          slug: blog.slug,
        }
      })
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export async function generateMetadata(
  { params }: { params: ParamsPromise }
): Promise<Metadata> {
  const { slug, category } = await params
  const supabase = supabaseServer()

  try {
    const { data: blog, error } = await supabase
      .from("blogs")
      .select(`
        title, 
        excerpt, 
        content, 
        featured_image, 
        created_at, 
        updated_at, 
        author,
        category,
        tags,
        meta_description,
        keywords
      `)
      .eq("slug", slug)
      .eq("published", true)
      .single()

    if (error || !blog) {
      return {
        title: "Blog Post Not Found | Saran Zafar",
        description: "The blog post you're looking for does not exist.",
        alternates: { canonical: `${baseUrl}/blogs/${category}/${slug}` },
        robots: {
          index: false,
          follow: true
        }
      }
    }

    const url = `${baseUrl}/blogs/${category}/${slug}`

    // Create comprehensive description from multiple sources
    const description = blog.meta_description ||
      blog.excerpt ||
      (blog.content ?
        blog.content.replace(/[#*`]/g, '').substring(0, 155).trim() + "..." :
        `Read "${blog.title}" by ${blog.author} on Saran Zafar's blog.`
      )

    // Extract keywords from content if not provided
    const keywords = blog.keywords ||
      (blog.tags ? blog.tags.join(', ') : '') ||
      blog.category ||
      'blog, article, tutorial'

    // Create structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": description,
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
      "keywords": keywords,
      "inLanguage": "en-US",
      "url": url
    }

    return {
      title: `${blog.title} | Saran Zafar`,
      description,
      keywords: keywords,
      authors: [{ name: blog.author }],
      creator: blog.author,
      publisher: "Saran Zafar",
      alternates: {
        canonical: url
      },
      openGraph: {
        title: blog.title,
        description,
        url,
        type: "article",
        siteName: "Saran Zafar Blog",
        publishedTime: blog.created_at,
        modifiedTime: blog.updated_at || blog.created_at,
        authors: [blog.author],
        section: blog.category || "Blog",
        tags: blog.tags || [],
        images: [
          {
            url: blog.featured_image || `${baseUrl}/og-default.png`,
            width: 1200,
            height: 630,
            alt: blog.title,
            type: "image/png"
          }
        ],
        locale: "en_US"
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description,
        creator: "@saranzafar", // Add your Twitter handle
        site: "@saranzafar",
        images: [
          {
            url: blog.featured_image || `${baseUrl}/og-default.png`,
            alt: blog.title,
            width: 1200,
            height: 630
          }
        ]
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },
      other: {
        "article:author": blog.author,
        "article:published_time": blog.created_at,
        "article:modified_time": blog.updated_at || blog.created_at,
        "article:section": blog.category || "Blog",
        "article:tag": Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
        "og:updated_time": blog.updated_at || blog.created_at,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Error Loading Blog Post | Saran Zafar",
      description: "There was an error loading this blog post.",
      alternates: { canonical: `${baseUrl}/blogs/${category}/${slug}` }
    }
  }
}

export default async function BlogDetailPage(
  { params }: { params: ParamsPromise }
) {
  const resolved = await params
  const { slug, category } = resolved

  // Verify the blog exists server-side for better SEO
  const supabase = supabaseServer()

  try {
    const { data: blog, error } = await supabase
      .from("blogs")
      .select("slug, category, category_slug")
      .eq("slug", slug)
      .eq("published", true)
      .single()

    if (error || !blog) {
      notFound()
    }

    // Verify category matches
    const actualCategorySlug = blog.category_slug ||
      (blog.category ? blog.category.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() : '')

    if (actualCategorySlug !== category) {
      notFound()
    }
  } catch (error) {
    console.error("Error verifying blog:", error)
    notFound()
  }

  return <ClientBlogDetailPage params={resolved} />
}