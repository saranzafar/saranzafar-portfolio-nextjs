"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield } from "lucide-react"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show development mode warning if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white">
        <div className="container py-8">
          <Card className="bg-yellow-900/20 border-yellow-500/50 max-w-2xl mx-auto mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-yellow-400">Development Mode</CardTitle>
              </div>
              <CardDescription className="text-yellow-200/80">
                Supabase authentication is not configured. In production, this page would require login. Set up your
                Supabase environment variables to enable authentication.
              </CardDescription>
            </CardHeader>
          </Card>
          {children}
        </div>
      </div>
    )
  }

  // Show unauthorized state if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-center">
        <Card className="bg-zinc-800 border-zinc-700 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              <CardTitle className="text-red-400">Access Denied</CardTitle>
            </div>
            <CardDescription>You need to be authenticated to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}
