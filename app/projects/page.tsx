"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Home } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/project-card"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface Project {
  id: string
  title: string
  description: string
  content: string
  technologies: string[]
  featured_image: string
  demo_url: string
  repo_url: string
  slug: string
  published: boolean
  created_at: string
  category: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allTechnologies, setAllTechnologies] = useState<string[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, selectedCategory])

  const fetchProjects = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      setProjects(data || [])

      // Extract unique categories and technologies
      const categories = new Set<string>()
      const technologies = new Set<string>()

      data?.forEach((project) => {
        if (project.category) categories.add(project.category)
        project.technologies?.forEach((tech: string) => technologies.add(tech))
      })

      setAllCategories(Array.from(categories))
      setAllTechnologies(Array.from(technologies))
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies?.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((project) => project.category === selectedCategory)
    }

    setFilteredProjects(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
      <div className="container py-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">All Projects</h1>
              <p className="text-zinc-400">Explore my portfolio and recent work</p>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-12">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-700 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              onClick={() => setSelectedCategory("all")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                    : "border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800/50"
                }`}
              >
                All Projects ({projects.length})
              </Badge>
            </motion.button>

            {allCategories.map((category) => {
              const categoryCount = projects.filter((p) => p.category === category).length
              return (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                        : "border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800/50"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCount})
                  </Badge>
                </motion.button>
              )
            })}
          </div>

          {/* Results count */}
          <div className="text-center">
            <p className="text-zinc-400">
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <Search className="h-12 w-12 text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-zinc-400 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No projects have been published yet."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      Clear search
                    </Button>
                  )}
                  {selectedCategory !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      Show all categories
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  tags={project.technologies || []}
                  image={project.featured_image || "/placeholder.svg?height=400&width=600"}
                  demoUrl={project.demo_url || "#"}
                  repoUrl={project.repo_url || "#"}
                  slug={project.slug}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Technology Tags Section */}
        {allTechnologies.length > 0 && (
          <div className="mt-16 pt-16 border-t border-zinc-800">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Technologies Used</h3>
              <p className="text-zinc-400">Technologies featured across all projects</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {allTechnologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:border-purple-500/50 hover:bg-zinc-800/50 cursor-pointer transition-all"
                  onClick={() => setSearchTerm(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
