import { Separator } from "@/components/ui/separator"
import { PasswordForm } from "@/components/settings/password-form"

export default function SettingsSecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Bảo mật</h3>
                <p className="text-muted-foreground">
                    Cập nhật mật khẩu và tăng cường bảo vệ tài khoản.
                </p>
            </div>
            <Separator className="my-6" />
            <PasswordForm />
        </div>
    )
}
