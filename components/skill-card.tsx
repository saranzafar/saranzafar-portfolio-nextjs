"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface SkillCardProps {
  name: string
  icon?: string // ✨ optional
  websiteUrl: string
  category: string
}

// Tech icon mapping - you can extend this with more icons
const techIcons: Record<string, string> = {
  javascript: "🟨",
  typescript: "🔷",
  react: "⚛️",
  nextjs: "▲",
  nodejs: "🟢",
  html5: "🌐",
  tailwindcss: "🎨",
  graphql: "🔗",
  postgresql: "🐘",
  aws: "☁️",
  docker: "🐳",
  git: "📝",
  python: "🐍",
  vue: "💚",
  angular: "🅰️",
  svelte: "🧡",
  mongodb: "🍃",
  mysql: "🐬",
  redis: "🔴",
  firebase: "🔥",
  vercel: "▲",
  netlify: "💎",
  figma: "🎨",
  photoshop: "🎨",
}

const categoryColors: Record<string, string> = {
  frontend: "from-blue-500/20 to-cyan-500/20",
  backend: "from-green-500/20 to-emerald-500/20",
  database: "from-purple-500/20 to-violet-500/20",
  cloud: "from-orange-500/20 to-amber-500/20",
  devops: "from-red-500/20 to-pink-500/20",
  tools: "from-gray-500/20 to-slate-500/20",
  design: "from-pink-500/20 to-rose-500/20",
  other: "from-indigo-500/20 to-blue-500/20",
}

export function SkillCard({ name, icon, websiteUrl, category }: SkillCardProps) {
  // Safe key: fall back to empty string when icon is null/undefined
  const iconKey = (icon ?? "").toLowerCase()
  const iconDisplay = techIcons[iconKey] || "⚡"
  const gradientColor = categoryColors[category] || "from-indigo-500/20 to-blue-500/20"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={websiteUrl} target="_blank" rel="noopener noreferrer" className="block group">
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientColor} backdrop-blur-sm border border-zinc-700/50 p-6 h-full transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10`}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Icon */}
            <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-110">
              {iconDisplay}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
              {name}
            </h3>

            {/* External link indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </div>
      </Link>
    </motion.div>
  )
}
