/**
 * Auth Validation Schemas using Zod
 * Provides server-side and client-side validation for authentication forms
 */

import { z } from 'zod'

// Constants for password length
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

// Regex patterns
const passwordSchema = z
  .string()
  .min(1, 'Mật khẩu không được để trống')
  .min(PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`)
  .max(PASSWORD_MAX_LENGTH, `Mật khẩu không được quá ${PASSWORD_MAX_LENGTH} ký tự`)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)'
  )

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .max(255, 'Email quá dài'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống'), // Login usually doesn't need strict complexity check
  rememberMe: z.boolean(),
})

/**
 * Register form validation schema
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ và tên không được để trống')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không được quá 100 ký tự')
      .regex(
        /^[\p{L}\s]+$/u,
        'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
      )
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ')
      .max(255, 'Email quá dài')
      .transform((val) => val.toLowerCase().trim()),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản dịch vụ'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .max(255, 'Email quá dài')
    .transform((val) => val.toLowerCase().trim()),
})

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    token: z.string().min(1, 'Token không được để trống'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

/**
 * Change password validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới phải khác mật khẩu cũ",
    path: ["newPassword"],
  });

// Type exports for TypeScript inference
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
