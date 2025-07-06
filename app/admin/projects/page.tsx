"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Search, Filter, Calendar, Code2, ExternalLink, Github, MoreVertical, Folder, Layout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AuthGuard } from "@/components/auth-guard"
import { AdminHeader } from "@/components/admin-header"

type Project = {
  id: string
  title: string
  description: string
  slug: string
  featured_image: string
  demo_url: string
  repo_url: string
  featured: boolean
  published: boolean
  created_at: string
  technologies: string[]
  category: string
}

export default function AdminProjectsPage() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [featuredFilter, setFeaturedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchProjects()
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, searchTerm, statusFilter, categoryFilter, featuredFilter, sortBy])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch projects.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProjects = () => {
    let filtered = projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "published" && project.published) ||
        (statusFilter === "draft" && !project.published)

      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter

      const matchesFeatured = featuredFilter === "all" ||
        (featuredFilter === "featured" && project.featured) ||
        (featuredFilter === "not-featured" && !project.featured)

      return matchesSearch && matchesStatus && matchesCategory && matchesFeatured
    })

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    setFilteredProjects(filtered)
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ published: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? { ...project, published: !currentStatus } : project)),
      )

      toast({
        title: "Success",
        description: `Project ${!currentStatus ? "published" : "unpublished"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive",
      })
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? { ...project, featured: !currentStatus } : project)),
      )

      toast({
        title: "Success",
        description: `Project ${!currentStatus ? "featured" : "unfeatured"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project featured status.",
        variant: "destructive",
      })
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) throw error

      setProjects(projects.filter((project) => project.id !== id))
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const getProjectStats = () => {
    const published = projects.filter(p => p.published).length
    const featured = projects.filter(p => p.featured).length
    const drafts = projects.filter(p => !p.published).length
    const categories = [...new Set(projects.map(p => p.category))].length
    return { total: projects.length, published, featured, drafts, categories }
  }

  const getUniqueCategories = () => {
    return [...new Set(projects.map(p => p.category).filter(Boolean))]
  }

  const stats = getProjectStats()
  const categories = getUniqueCategories()

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
            <p className="text-zinc-300">Loading projects...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8 max-w-7xl mx-auto">
          <AdminHeader title="Manage Projects" description="Create, edit, and manage your portfolio projects" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Total Projects</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Layout className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Published</p>
                    <p className="text-2xl font-bold text-green-400">{stats.published}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Featured</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.featured}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Categories</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.categories}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Folder className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search projects by title, description, or technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-zinc-800/50 border-zinc-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                  <SelectTrigger className="w-32 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="not-featured">Not Featured</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add New Project Button */}
            <Link href="/admin/upload-project">
              <Button className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="text-zinc-400 mb-4">
                  {projects.length === 0 ? "No projects found" : "No projects match your search criteria"}
                </div>
                {projects.length === 0 && (
                  <Link href="/admin/upload-project">
                    <Button>Create Your First Project</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-zinc-100 truncate">{project.title}</CardTitle>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant={project.published ? "default" : "secondary"}>
                              {project.published ? "Published" : "Draft"}
                            </Badge>
                            {project.featured && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardDescription className="text-zinc-400 line-clamp-2 mb-3">
                          {project.description}
                        </CardDescription>

                        {/* Category */}
                        {project.category && (
                          <div className="flex items-center gap-2 mb-3">
                            <Folder className="h-4 w-4 text-zinc-500" />
                            <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                              {project.category}
                            </Badge>
                          </div>
                        )}

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Code2 className="h-4 w-4 text-zinc-500 mr-1 mt-0.5" />
                            {project.technologies.slice(0, 4).map((tech: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 4 && (
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                                +{project.technologies.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                          {project.demo_url && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              <span>Demo</span>
                            </div>
                          )}
                          {project.repo_url && (
                            <div className="flex items-center gap-1">
                              <Github className="h-3 w-3" />
                              <span>Repository</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Featured Image */}
                      {project.featured_image && (
                        <div className="ml-4 shrink-0">
                          <img
                            src={project.featured_image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-24 h-24 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/edit-project/${project.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(project.id, project.published)}
                      >
                        {project.published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(project.id, project.featured)}
                      >
                        {project.featured ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>

                      {project.published && project.slug && (
                        <Link href={`/projects/${project.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      )}

                      {/* External Links */}
                      {project.demo_url && (
                        <Link href={project.demo_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Demo
                          </Button>
                        </Link>
                      )}

                      {project.repo_url && (
                        <Link href={project.repo_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <Github className="h-4 w-4 mr-2" />
                            Code
                          </Button>
                        </Link>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuItem
                            onClick={() => deleteProject(project.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Info */}
          {filteredProjects.length > 0 && (
            <div className="mt-6 text-center text-sm text-zinc-400">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}