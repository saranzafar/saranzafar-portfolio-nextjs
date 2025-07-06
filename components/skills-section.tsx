"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SkillCard } from "./skill-card"
import { SectionHeading } from "./section-heading"
import { Badge } from "@/components/ui/badge"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface Skill {
  id: string
  name: string
  icon: string
  website_url: string
  category: string
  featured: boolean
}

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  cloud: "Cloud",
  devops: "DevOps",
  tools: "Tools",
  design: "Design",
  other: "Other",
}

export function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("featured", { ascending: false })
        .order("name", { ascending: true })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(skills.map((skill) => skill.category)))]

  // Filter skills by category
  const filteredSkills =
    selectedCategory === "all" ? skills : skills.filter((skill) => skill.category === selectedCategory)

  // Group skills by category for display
  const groupedSkills = filteredSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  if (isLoading) {
    return (
      <div className="container relative z-10">
        <SectionHeading title="My Skills" subtitle="Technologies I work with" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-16">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container relative z-10">
      <SectionHeading title="My Skills" subtitle="Technologies I work with" />

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mt-12 mb-8">
        {categories.map((category) => (
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
              {category === "all" ? "All" : categoryLabels[category] || category}
            </Badge>
          </motion.button>
        ))}
      </div>

      {/* Skills Grid */}
      {selectedCategory === "all" ? (
        // Show grouped by category
        <div className="space-y-12 mt-16">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  {categoryLabels[category] || category}
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categorySkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <SkillCard
                      name={skill.name}
                      icon={skill.icon}
                      websiteUrl={skill.website_url}
                      category={skill.category}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Show filtered skills in a single grid
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-16">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <SkillCard name={skill.name} icon={skill.icon} websiteUrl={skill.website_url} category={skill.category} />
            </motion.div>
          ))}
        </div>
      )}

      {filteredSkills.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No skills found in this category.</p>
        </div>
      )}
    </div>
  )
}
