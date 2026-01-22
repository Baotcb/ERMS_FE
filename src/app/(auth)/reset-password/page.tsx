import { Metadata } from "next"
import { ResetPasswordForm } from "@/features/core/auth/components/reset-password-form"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: "Đặt lại mật khẩu",
    description: "Đặt lại mật khẩu của bạn",
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-md">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
