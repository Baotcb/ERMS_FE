"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"
import { BrainCircuit, GraduationCap, FileCheck, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LandingPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to appropriate pages based on role
    if (!isLoading && isAuthenticated && user) {
      switch (user.role?.toLowerCase()) {
        case 'manager':
        case 'admin':
        case 'hr':
          router.push('/recruitment/hr/jobs')
          break
        case 'employee':
          // Stay on home or redirect to learning module when implemented
          router.push('/')
          break
        case 'candidate':
          router.push('/recruitment/candidate')
          break
        default:
          router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading spinner during auth check
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  // Only show landing page to guests
  if (isAuthenticated && user) {
    return null // Will redirect via useEffect
  }

  // Landing page content for guest users
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}



      </main>

      <Footer />
    </div>
  )
}
