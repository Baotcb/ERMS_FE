import { z } from 'zod'

// Validation schemas
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(254, 'Email is too long')
        .transform((email) => email.toLowerCase().trim())
})

export const resetPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email là bắt buộc')
        .email('Vui lòng nhập địa chỉ email hợp lệ')
        .max(254, 'Email quá dài')
        .transform((email) => email.toLowerCase().trim()),
    token: z
        .string()
        .min(1, 'Token là bắt buộc'),
    newPassword: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(100, 'Mật khẩu quá dài')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất một chữ cái viết thường, một chữ cái viết hoa và một số'),
    confirmPassword: z
        .string()
        .min(1, 'Vui lòng xác nhận mật khẩu của bạn')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"]
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
