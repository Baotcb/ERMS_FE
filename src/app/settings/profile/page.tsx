import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/settings/profile-form"

export default function SettingsProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h3>
                <p className="text-muted-foreground">
                    Quản lý thông tin cá nhân và cách hiển thị của bạn.
                </p>
            </div>
            <Separator className="my-6" />
            <ProfileForm />
        </div>
    )
}
