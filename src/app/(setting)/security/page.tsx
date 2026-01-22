import { ChangePasswordForm } from "@/features/core/user-profile/components/change-password-form";
import { Lock } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-dark mb-2">Bảo mật</h1>
                <p className="text-slate-500 text-sm">Quản lý cài đặt bảo mật cho tài khoản của bạn</p>
            </div>

            <ChangePasswordForm />

            {/* Other Security Options (Placeholder) */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm opacity-50 pointer-events-none">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Xác thực 2 bước (2FA)</h3>
                    <p className="text-sm text-slate-500">Tăng cường bảo mật cho tài khoản của bạn.</p>
                </div>
                <button
                    className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md text-slate-400 bg-slate-50 cursor-not-allowed"
                    disabled
                >
                    Sắp ra mắt
                </button>
            </div>
        </div>
    );
}
