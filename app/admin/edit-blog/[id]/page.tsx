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
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"
import dynamic from "next/dynamic"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [blogLoading, setBlogLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    tags: "",
    featured_image: "",
    published: false,
  })

  useEffect(() => {
    fetchBlog()
  }, [id])

  const fetchBlog = async () => {
    if (!isSupabaseConfigured) {
      setBlogLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single()

      if (error) throw error

      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        author: data.author || "",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        featured_image: data.featured_image || "",
        published: data.published || false,
      })
    } catch (error) {
      console.error("Error fetching blog:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blog data",
        variant: "destructive",
      })
    } finally {
      setBlogLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `blog-images/${fileName}`

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

    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error } = await supabase
        .from("blogs")
        .update({
          ...formData,
          tags: tagsArray,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Blog post updated successfully",
      })

      router.push("/admin/blogs")
    } catch (error: any) {
      console.error("Error updating blog:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (blogLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading blog...</p>
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
              <CardDescription>Please set up your Supabase environment variables to edit blogs.</CardDescription>
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
          <AdminHeader title="Edit Blog Post" description="Update your blog article" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                  <CardHeader>
                    <CardTitle>Blog Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter blog title"
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
                        placeholder="blog-post-slug"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Brief description of the blog post"
                        className="bg-zinc-900/50 border-zinc-700"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Content *</Label>
                      <div className="rounded-lg overflow-hidden border border-zinc-700">
                        <MDEditor
                          value={formData.content}
                          onChange={(value) => setFormData({ ...formData, content: value || "" })}
                          preview="live"
                          height={400}
                          data-color-mode="dark"
                          visibleDragbar={false}
                          textareaProps={{
                            placeholder: "Start writing your blog post...",
                            style: {
                              fontSize: 14,
                              lineHeight: 1.5,
                              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            },
                          }}
                          previewOptions={{
                            rehypePlugins: [],
                            remarkPlugins: [],
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-200">
                  <CardHeader>
                    <CardTitle>Publish Settings</CardTitle>
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

                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="react, nextjs, javascript"
                        className="bg-zinc-900/50 border-zinc-700"
                      />
                      <p className="text-xs text-zinc-500">Separate tags with commas</p>
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
                  <Link href="/admin/blogs" className="flex-1">
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
                        Update Blog
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
