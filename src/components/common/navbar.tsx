"use client"

import Link from "next/link"
import { BookOpen, Briefcase, User, Home, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User as UserType } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface NavbarProps {
  user?: UserType | null
}

export function Navbar({ user: propUser }: NavbarProps) {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()

  // Use auth context user if available, otherwise use prop user
  const user = authUser || propUser
  const isGuest = !user || user.role === "guest"
  const isEmployee = user?.role === "employee"
  const isHR = user?.role === "hr" || user?.role === "HR" || user?.role === "HR Manager"

  // Debug logs

  const guestLinks = [
    { label: "Trang chủ", href: "/", icon: <Home className="size-4" /> },
    { label: "Cơ hội nghề nghiệp", href: "/careers", icon: <Briefcase className="size-4" /> },
    { label: "Về chúng tôi", href: "/about" },
  ]

  const employeeLinks = [
    { label: "Học tập của tôi", href: "/my-learning", icon: <BookOpen className="size-4" /> },
    { label: "Lịch sử đào tạo", href: "/training-history", icon: <Award className="size-4" /> },
  ]

  const hrLinks = [
    { label: "Tuyển dụng", href: "/recruitment/jobs", icon: <Briefcase className="size-4" /> },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-bold text-white text-lg">E</span>
          </div>
          <span className="font-bold text-xl text-foreground">ERMS</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {isGuest ? (
            <>
              {guestLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          ) : isEmployee ? (
            <>
              {employeeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          ) : isHR ? (
            <>
              {hrLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isGuest ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-10 rounded-full p-0">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-background px-4 py-2">
        <div className="flex gap-4 overflow-x-auto">
          {isGuest
            ? guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
              >
                {link.icon}
                {link.label}
              </Link>
            ))
            : isEmployee
              ? employeeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))
              : null}
        </div>
      </div>
    </nav >
  )
}
