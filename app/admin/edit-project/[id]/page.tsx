"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [projectLoading, setProjectLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    technologies: "",
    category: "",
    featured_image: "",
    demo_url: "",
    repo_url: "",
    published: false,
    featured: false,
  })

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    if (!isSupabaseConfigured) {
      setProjectLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

      if (error) throw error

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        content: data.content || "",
        technologies: Array.isArray(data.technologies) ? data.technologies.join(", ") : "",
        category: data.category || "",
        featured_image: data.featured_image || "",
        demo_url: data.demo_url || "",
        repo_url: data.repo_url || "",
        published: data.published || false,
        featured: data.featured || false,
      })
    } catch (error) {
      console.error("Error fetching project:", error)
      toast({
        title: "Error",
        description: "Failed to fetch project data",
        variant: "destructive",
      })
    } finally {
      setProjectLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `project-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath)

      setFormData({ ...formData, featured_image: publicUrl })

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const technologiesArray = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0)

      const { error } = await supabase
        .from("projects")
        .update({
          ...formData,
          technologies: technologiesArray,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      router.push("/admin/projects")
    } catch (error: any) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (projectLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading project...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!isSupabaseConfigured) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <Card className="bg-zinc-800 border-zinc-700 max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400">Supabase Not Configured</CardTitle>
              <CardDescription>Please set up your Supabase environment variables to edit projects.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8">
          <AdminHeader title="Edit Project" description="Update your portfolio project" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter project title"
                        className="bg-zinc-900/50 border-zinc-700"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="project-slug"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the project"
                        className="bg-zinc-900/50 border-zinc-700"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Detailed Content</Label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-200">
                  <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured project</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="web, mobile, desktop"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="technologies">Technologies</Label>
                      <Input
                        id="technologies"
                        value={formData.technologies}
                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                        placeholder="React, Next.js, TypeScript"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                      <p className="text-xs text-zinc-500">Separate technologies with commas</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demo_url">Demo URL</Label>
                      <Input
                        id="demo_url"
                        value={formData.demo_url}
                        onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                        placeholder="https://example.com"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repo_url">Repository URL</Label>
                      <Input
                        id="repo_url"
                        value={formData.repo_url}
                        onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                        placeholder="https://github.com/username/repo"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-200">
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.featured_image && (
                      <div className="relative">
                        <img
                          src={formData.featured_image || "/placeholder.svg"}
                          alt="Featured"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, featured_image: "" })}
                        >
                          Remove
                        </Button>
                      </div>
                    )}

                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="bg-zinc-900/50 border-zinc-700"
                        disabled={imageUploading}
                      />
                      {imageUploading && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                          Uploading...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Link href="/admin/projects" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-zinc-700 hover:bg-zinc-800 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Project
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
