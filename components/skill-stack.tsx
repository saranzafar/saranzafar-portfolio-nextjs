"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface Skill {
  id: string
  name: string
  icon_url: string | null
  website_url: string
}

export function SkillStack() {
  const [skills, setSkills] = useState<Skill[]>([])
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
      const { data, error } = await supabase.from("skills").select("*").order("created_at", { ascending: true })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 w-24 bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400">No skills added yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.id}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href={skill.website_url} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="relative overflow-hidden rounded-lg bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 px-4 py-3 transition-all duration-300 hover:border-purple-500/50 hover:bg-zinc-700/50">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>

              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {skill.icon_url ? (
                    <img
                      src={skill.icon_url || "/placeholder.svg"}
                      alt={`${skill.name} icon`}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {skill.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                  {skill.name}
                </span>

                {/* External link icon */}
                <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
