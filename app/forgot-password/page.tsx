"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Mail, AlertCircle } from "lucide-react"
import { authService } from "@/lib/auth"
import { ApiException } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await authService.forgotPassword({ email })

      toast({
        title: "Yêu cầu thành công",
        description:
          "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi. Bạn sẽ được chuyển về trang đăng nhập sau 3 giây.",
      })

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message || "Đã xảy ra sự cố")
      } else {
        setError("Đã xảy ra sự cố")
      }

      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar user={null} />

      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-600">
              <Mail className="size-6 text-white" />
            </div>

            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email để nhận liên kết đặt lại mật khẩu
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
