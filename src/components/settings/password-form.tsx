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

        </Card>
    )
}
