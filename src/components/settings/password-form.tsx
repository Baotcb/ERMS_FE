"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export function PasswordForm() {
    return (
        <Card className="border-t-4 border-t-orange-500 shadow-md">
            <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20">
                <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <ShieldCheck className="size-5" />
                    Đổi Mật Khẩu
                </CardTitle>
                <CardDescription>
                    Để bảo mật tài khoản, hãy thường xuyên cập nhật mật khẩu của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">
                        Hệ thống hiện tại hỗ trợ đổi mật khẩu thông qua quy trình "Quên mật khẩu" xác thực qua email.
                    </p>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href="/forgot-password">
                            Đến trang Quên mật khẩu
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
