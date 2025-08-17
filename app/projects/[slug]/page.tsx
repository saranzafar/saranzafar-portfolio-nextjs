"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, Share2, Copy, Twitter, Linkedin, Facebook, MessageCircleReply } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import MDEditor from '@uiw/react-md-editor'
import { useToast } from "@/hooks/use-toast" // ✅ for toast when copying link

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [slug, setSlug] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      fetchProject(resolvedParams.slug)
    }
    getParams()
  }, [params])

  const fetchProject = async (projectSlug: string) => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", projectSlug)
        .eq("published", true)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  // ✅ Copy link to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl)
    toast({
      title: "Link copied!",
      description: "You can now share it anywhere.",
    })
  }

  // ✅ Social share links
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(project?.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(project?.title + " " + currentUrl)}`,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-zinc-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link href="/projects">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <div className="container py-32">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Project Header */}
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {project.featured_image && (
            <div className="relative overflow-hidden rounded-xl mb-8">
              <img
                src={project.featured_image || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              {project.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-black">Featured</Badge>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-zinc-400 mb-8">{project.description}</p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <Badge variant="outline">{project.category}</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.demo_url && (
              <Link href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </Button>
              </Link>
            )}
            {project.repo_url && (
              <Link href={project.repo_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  View Code
                </Button>
              </Link>
            )}
          </div>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Content */}
          {project.content && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6">Project Details</h3>
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-purple-400 prose-strong:text-white prose-code:text-purple-300 prose-pre:bg-zinc-900 prose-blockquote:border-purple-500 prose-ol:list-decimal prose-ul:list-disc prose-li:text-zinc-300">
                <MDEditor.Markdown
                  source={project.content}
                  style={{ backgroundColor: "transparent", color: "inherit" }}
                />
              </div>
            </div>
          )}

          {/* ✅ Share Buttons */}
          <div className="mt-12 border-t border-zinc-800 pt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Share this project
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopy} variant="outline" className="border-zinc-700 hover:bg-zinc-800 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Link href={shareLinks.twitter} target="_blank">
                <Button className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter
                </Button>
              </Link>
              <Link href={shareLinks.linkedin} target="_blank">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Button>
              </Link>
              <Link href={shareLinks.facebook} target="_blank">
                <Button className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2">
                  <Facebook className="h-4 w-4" /> Facebook
                </Button>
              </Link>
              <Link href={shareLinks.whatsapp} target="_blank">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <MessageCircleReply className="h-4 w-4" /> WhatsApp
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-zinc-400">
                <p>Created on {new Date(project.created_at).toLocaleDateString()}</p>
                {project.updated_at !== project.created_at && (
                  <p className="text-sm">Last updated on {new Date(project.updated_at).toLocaleDateString()}</p>
                )}
              </div>
              <Link href="/projects">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
                  View More Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
