"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck, Lock, KeyRound, CheckCircle2 } from "lucide-react"

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
        newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
            .regex(/[A-Z]/, "Phải chứa ít nhất 1 chữ hoa")
            .regex(/[0-9]/, "Phải chứa ít nhất 1 số"),
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function PasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    async function onSubmit(data: PasswordFormValues) {
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)

        toast({
            title: "Đổi mật khẩu thành công",
            description: "Mật khẩu của bạn đã được cập nhật an toàn.",
        })

        form.reset()
    }

    return (
        <Card className="border-t-4 border-t-orange-500 shadow-md">
            <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20">
                <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <ShieldCheck className="size-5" />
                    Đổi Mật Khẩu
                </CardTitle>
                <CardDescription>
                    Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ cho người khác.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                        Mật khẩu mạnh bao gồm:
                                    </h3>
                                    <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                                        <ul className="list-disc space-y-1 pl-5">
                                            <li>Độ dài tối thiểu 6 ký tự</li>
                                            <li>Chứa ít nhất một chữ cái viết hoa (A-Z)</li>
                                            <li>Chứa ít nhất một chữ số (0-9)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={isSubmitting} className="min-w-[140px] bg-orange-600 hover:bg-orange-700">
                                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
