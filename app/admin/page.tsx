"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, FolderOpen, Eye, Settings, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

interface DashboardStats {
  totalBlogs: number
  publishedBlogs: number
  totalProjects: number
  featuredProjects: number
  totalSkills: number
  featuredSkills: number
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalProjects: 0,
    featuredProjects: 0,
    totalSkills: 0,
    featuredSkills: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentBlogs, setRecentBlogs] = useState<any[]>([])
  const [recentProjects, setRecentProjects] = useState<any[]>([])

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch blog stats
      const { data: blogs, error: blogsError } = await supabase
        .from("blogs")
        .select("id, title, published, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (blogsError) throw blogsError

      // Fetch project stats
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, title, featured, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch skills stats
      const { data: skills, error: skillsError } = await supabase.from("skills").select("id, name, featured")

      const projectsData = projectsError ? [] : projects || []
      const skillsData = skillsError ? [] : skills || []

      setStats({
        totalBlogs: blogs?.length || 0,
        publishedBlogs: blogs?.filter((blog) => blog.published).length || 0,
        totalProjects: projectsData.length,
        featuredProjects: projectsData.filter((p: any) => p.featured).length,
        totalSkills: skillsData.length,
        featuredSkills: skillsData.filter((s: any) => s.featured).length,
      })

      setRecentBlogs(blogs || [])
      setRecentProjects(projectsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    {
      title: "New Blog Post",
      description: "Write and publish a new blog article",
      icon: FileText,
      href: "/admin/upload-blog",
      color: "bg-blue-500",
    },
    {
      title: "New Project",
      description: "Add a new project to your portfolio",
      icon: FolderOpen,
      href: "/admin/upload-project",
      color: "bg-green-500",
    },
    {
      title: "New Skill",
      description: "Add a skill to your expertise",
      icon: Zap,
      href: "/admin/upload-skill",
      color: "bg-yellow-500",
    },
    {
      title: "Manage Blogs",
      description: "View and edit existing blog posts",
      icon: Eye,
      href: "/admin/blogs",
      color: "bg-purple-500",
    },
    {
      title: "Manage Projects",
      description: "View and edit existing projects",
      icon: Settings,
      href: "/admin/projects",
      color: "bg-orange-500",
    },
    {
      title: "Manage Skills",
      description: "View and edit your skills",
      icon: Settings,
      href: "/admin/skills",
      color: "bg-pink-500",
    },
  ]

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <Card className="bg-zinc-800 border-zinc-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Supabase Not Configured</CardTitle>
            <CardDescription>
              Please set up your Supabase environment variables to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8">
          <AdminHeader title="Admin Dashboard" description="Manage your portfolio content" />

          {/* Rest of the existing content */}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-zinc-200">
                <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-zinc-100">
                <div className="text-2xl font-bold">{stats.totalBlogs}</div>
                <p className="text-xs text-muted-foreground">{stats.publishedBlogs} published</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-zinc-200">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-100">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">{stats.featuredProjects} featured</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-zinc-200">
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-100">{stats.totalSkills}</div>
                <p className="text-xs text-muted-foreground">{stats.featuredSkills} featured</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg text-zinc-200">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Blogs */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <div className="flex items-center justify-between text-white">
                  <CardTitle>Recent Blogs</CardTitle>
                  <Link href="/admin/blogs">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentBlogs.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No blogs yet</p>
                    <Link href="/admin/upload-blog">
                      <Button size="sm" className="mt-2">
                        Create First Blog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBlogs.map((blog) => (
                      <div key={blog.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                        <div>
                          <h4 className="font-medium text-zinc-200">{blog.title}</h4>
                          <p className="text-sm text-zinc-400">{new Date(blog.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={blog.published ? "default" : "secondary"}>
                          {blog.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-zinc-800/50 border-zinc-700 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link href="/admin/projects">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentProjects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet</p>
                    <Link href="/admin/upload-project">
                      <Button size="sm" className="mt-2">
                        Create First Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                        <div>
                          <h4 className="font-medium text-zinc-200">{project.title}</h4>
                          <p className="text-sm text-zinc-400">{new Date(project.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={project.featured ? "default" : "secondary"}>
                          {project.featured ? "Featured" : "Regular"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
