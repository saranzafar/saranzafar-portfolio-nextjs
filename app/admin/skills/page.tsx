"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

type Skill = {
  id: string
  name: string
  icon_url: string | null
  website_url: string
  created_at: string
}

export default function SkillsPage() {
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSkills()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase.from("skills").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error("Error fetching skills:", error)
      toast({
        title: "Error",
        description: "Failed to fetch skills.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("skills").delete().eq("id", id)

      if (error) throw error

      setSkills((prev) => prev.filter((skill) => skill.id !== id))
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Supabase not configured</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading skills...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <AdminHeader title="Skills Management" description="Manage your technology stack" />
            <Link href="/admin/upload-skill">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </Link>
          </div>

          {/* Skills List */}
          {skills.length === 0 ? (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="text-center py-12">
                <div className="text-zinc-400 mb-4">No skills found</div>
                <Link href="/admin/upload-skill">
                  <Button>Add Your First Skill</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <Card key={skill.id} className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {skill.icon_url ? (
                          <img
                            src={skill.icon_url || "/placeholder.svg"}
                            alt={`${skill.name} icon`}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {skill.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg text-zinc-100">{skill.name}</CardTitle>
                          <CardDescription className="text-sm">
                            Added {new Date(skill.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skill.website_url && (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <ExternalLink className="h-3 w-3" />
                          <a
                            href={skill.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 transition-colors truncate"
                          >
                            {skill.website_url}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Link href={`/admin/edit-skill/${skill.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 hover:bg-zinc-800 bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSkill(skill.id)}
                          className="border-red-700 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
