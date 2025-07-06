"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

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

export default function UploadProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
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

      const { data, error } = await supabase.from("projects").insert([
        {
          ...formData,
          technologies: technologiesArray,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Project created successfully",
      })

      router.push("/admin/projects")
    } catch (error: any) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        {isSupabaseConfigured ? (
          <div className="container py-8">
            <AdminHeader title="Create New Project" description="Add a new project to your portfolio" />

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-zinc-800/50 border-zinc-700 text-white">
                    <CardHeader className="text-zinc-200">
                      <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
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
                        <Label htmlFor="published">Publish immediately</Label>
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
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
            <Card className="bg-zinc-800 border-zinc-700 max-w-md">
              <CardHeader>
                <CardTitle className="text-red-400">Supabase Not Configured</CardTitle>
                <CardDescription>Please set up your Supabase environment variables to upload projects.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
