"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

export default function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [skillLoading, setSkillLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    icon_url: "",
  })

  useEffect(() => {
    fetchSkill()
  }, [id])

  const fetchSkill = async () => {
    if (!isSupabaseConfigured) {
      setSkillLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("skills").select("*").eq("id", id).single()

      if (error) throw error

      setFormData({
        name: data.name || "",
        website_url: data.website_url || "",
        icon_url: data.icon_url || "",
      })
    } catch (error) {
      console.error("Error fetching skill:", error)
      toast({
        title: "Error",
        description: "Failed to fetch skill data",
        variant: "destructive",
      })
    } finally {
      setSkillLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `skill-icons/${fileName}`

      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath)

      setFormData({ ...formData, icon_url: publicUrl })

      toast({
        title: "Success",
        description: "Icon uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading icon:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload icon",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.website_url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("skills").update(formData).eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Skill updated successfully",
      })

      router.push("/admin/skills")
    } catch (error: any) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update skill",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (skillLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading skill...</p>
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
              <CardDescription>Please set up your Supabase environment variables to edit skills.</CardDescription>
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
          <AdminHeader title="Edit Skill" description="Update your skill information" />

          <div className="max-w-2xl mx-auto">
            <Card className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
              <CardHeader>
                <CardTitle>Skill Details</CardTitle>
                <CardDescription>Update the skill information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Skill Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., React, Python, Figma"
                      className="bg-zinc-900/50 border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL *</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://reactjs.org"
                      className="bg-zinc-900/50 border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Skill Icon</Label>

                    {formData.icon_url && (
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700">
                        <img
                          src={formData.icon_url || "/placeholder.svg"}
                          alt="Skill icon"
                          className="w-12 h-12 object-contain"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current icon</p>
                          <p className="text-xs text-zinc-400">Upload a new file to replace</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, icon_url: "" })}
                          className="border-zinc-700 hover:bg-zinc-800"
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
                          Uploading icon...
                        </div>
                      )}
                      <p className="text-xs text-zinc-500 mt-2">
                        Upload an icon for this skill (optional). Recommended size: 64x64px
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Link href="/admin/skills" className="flex-1">
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
                          Update Skill
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
