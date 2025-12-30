"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ReactNode } from "react"

interface ProtectedLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function ProtectedLink({ href, children, className }: ProtectedLinkProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(href)}`)
    }
  }

  if (!isAuthenticated) {
    return (
      <span onClick={handleClick} className={className} style={{ cursor: "pointer" }}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

