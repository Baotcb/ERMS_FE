
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/utils/logger"
import { resetPassword } from "../api/auth-service"
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/auth-schemas"

export function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const email = searchParams.get("email")
    const token = searchParams.get("token")

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: email || "",
            token: token || "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: ResetPasswordFormData) {
        if (!data.token || !data.email) {
            toast({
                title: "Lỗi",
                description: "Thiếu thông tin xác thực (token hoặc email)",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)

        try {
            await resetPassword({
                email: data.email,
                token: data.token,
                newPassword: data.newPassword,
            })

            toast({
                title: "Thành công",
                description: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
                className: "bg-green-500 text-white"
            })
            router.push("/login")
        } catch (error) {
            logger.error('Failed to reset password', error)
            toast({
                title: "Lỗi",
                description: "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!email || !token) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Liên kết không hợp lệ</h2>
                <p className="text-slate-500 mb-6">
                    Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
                <Link href="/forgot-password">
                    <Button variant="outline">Yêu cầu liên kết mới</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 relative overflow-hidden">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-coral" />
            
            <div className="flex flex-col space-y-2 text-center mb-6">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-7 h-7 text-brand-primary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Đặt lại mật khẩu
                </h1>
                <p className="text-sm text-slate-500">
                    Nhập mật khẩu mới của bạn bên dưới
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Hidden fields for email and token */}
                <input type="hidden" {...form.register("email")} />
                <input type="hidden" {...form.register("token")} />

                <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                        id="newPassword"
                        placeholder="Nhập mật khẩu mới"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...form.register("newPassword")}
                    />
                    {form.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input
                        id="confirmPassword"
                        placeholder="Nhập lại mật khẩu mới"
                        type="password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button 
                    className="w-full bg-brand-primary hover:bg-brand-primary/90" 
                    type="submit" 
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đặt lại mật khẩu
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
                Nhớ mật khẩu?{' '}
                <Link href="/login" className="text-brand-primary font-semibold hover:underline">
                    Đăng nhập
                </Link>
            </p>
        </div>
    )
}
