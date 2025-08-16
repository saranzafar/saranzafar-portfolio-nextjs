"use client"

import Link from "next/link"
import { LogOut, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminHeaderProps {
  title: string
  description?: string
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-zinc-400">{description}</p>}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Home Button */}
        <Link href="/">
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-transparent">
            <Home className="h-4 w-4 mr-2" />
            View Site
          </Button>
        </Link>

        {/* User Menu */}
        <DropdownMenu >
          <DropdownMenuTrigger asChild className="flex">
            <Button
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800 bg-transparent flex items-center max-w-full"
            >
              <User className="h-4 w-4 mr-2 shrink-0" />
              <p className="truncate sm:whitespace-normal sm:break-words text-left min-w-0 flex-1">
                {user?.email || "Admin"}
              </p>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
            <DropdownMenuLabel className="text-zinc-300">
              Signed in as
              <div className="text-sm font-normal text-zinc-400">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-700" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 hover:bg-zinc-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
