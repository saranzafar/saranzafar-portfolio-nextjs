import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import ClientProjectDetailPage from "./ClientProjectDetailPage"

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

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, content, featured_image, created_at, updated_at, category")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!project) {
    return {
      title: "Project Not Found | Saran Zafar",
      description: "The project you’re looking for does not exist.",
      alternates: { canonical: `${baseUrl}/projects/${slug}` },
    }
  }

  const url = `${baseUrl}/projects/${slug}`
  const description =
    project.description ||
    (project.content ? project.content.substring(0, 160) + "..." : "See details about this project by Saran Zafar.")

  return {
    title: `${project.title} | Saran Zafar`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description,
      url,
      type: "website", // could also be "article"
      siteName: "Saran Zafar Portfolio",
      images: project.featured_image
        ? [{ url: project.featured_image, width: 1200, height: 630, alt: project.title }]
        : [{ url: `${baseUrl}/og.png`, width: 1200, height: 630, alt: "Saran Zafar Project" }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: project.featured_image ? [project.featured_image] : [`${baseUrl}/og.png`],
    },
    other: {
      "project:category": project.category ?? "",
      "og:published_time": project.created_at ?? "",
      "og:modified_time": project.updated_at ?? "",
    },
  }
}

export default async function Page(
  { params }: { params: ParamsPromise }
) {
  const resolved = await params 
  return <ClientProjectDetailPage params={resolved} />
}
