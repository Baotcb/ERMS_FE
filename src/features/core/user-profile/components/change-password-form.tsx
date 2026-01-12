"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordFormData } from "@/features/core/auth/schemas/auth-schemas";
import { authService } from "@/features/core/auth/api/auth-service";
import { useAuth } from "@/features/core/auth";

export function ChangePasswordForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: ChangePasswordFormData) {
        setIsLoading(true);
        setApiError(null);
        
        try {
            await authService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            toast({
                title: "Thành công",
                description: "Đã đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
                variant: "default",
                className: "bg-green-500 text-white border-none",
            });

            form.reset();

            // Logout and clear session after password change
            setTimeout(() => {
                logout();
                router.push("/login");
            }, 1500);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Không thể đổi mật khẩu.";
            
            // Check if error is related to wrong current password
            const isWrongPassword = errorMessage.toLowerCase().includes("incorrect") || 
                                   errorMessage.toLowerCase().includes("wrong") ||
                                   errorMessage.toLowerCase().includes("invalid") ||
                                   errorMessage.toLowerCase().includes("sai") ||
                                   errorMessage.toLowerCase().includes("không đúng");
            
            if (isWrongPassword) {
                setApiError("Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.");
                form.setFocus("currentPassword");
            } else {
                setApiError(errorMessage);
            }
            
            toast({
                title: "Lỗi",
                description: isWrongPassword ? "Mật khẩu hiện tại không đúng." : errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-primary" />
                    Đổi mật khẩu
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                </p>
            </div>

            {/* API Error Alert */}
            {apiError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-500 text-xs font-bold">!</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-800">{apiError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input
                        id="current-password"
                        type="password"
                        placeholder="•••••••"
                        {...form.register("currentPassword", {
                            onChange: () => setApiError(null), // Clear error when user types
                        })}
                        className={form.formState.errors.currentPassword || apiError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {form.formState.errors.currentPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.currentPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input
                        id="new-password"
                        type="password"
                        placeholder="•••••••"
                        {...form.register("newPassword")}
                        className={form.formState.errors.newPassword ? "border-red-500" : ""}
                    />
                    {form.formState.errors.newPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
                    )}
                    <p className="text-xs text-slate-400">
                        Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="•••••••"
                        {...form.register("confirmPassword")}
                        className={form.formState.errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[140px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đổi mật khẩu"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
