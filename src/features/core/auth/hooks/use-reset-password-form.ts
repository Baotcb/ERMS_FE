/**
 * Custom hook for reset password form logic
 * Handles form state, validation, and submission using React Hook Form + Zod
 */

'use client'

import { useFormHandler } from '@/hooks/use-form-handler'
import { resetPassword } from '../api/auth-service'
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/auth-schemas'
import { useToast } from '@/hooks/use-toast'

export function useResetPasswordForm(defaultEmail?: string, defaultToken?: string) {
  const { toast } = useToast()

  const formHandler = useFormHandler({
    schema: resetPasswordSchema,
    defaultValues: {
      email: defaultEmail || '',
      token: defaultToken || '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!data.token || !data.email) {
      throw new Error('Thiếu thông tin xác thực (token hoặc email)')
    }

    const response = await resetPassword({
      email: data.email,
      token: data.token,
      newPassword: data.newPassword,
    })

    toast({
      title: "Thành công",
      description: response.message || 'Đặt lại mật khẩu thành công!',
      variant: 'default',
      className: 'bg-green-500 text-white border-none',
    })
  }

  return {
    ...formHandler,
    handleSubmit: formHandler.handleSubmit(handleSubmit),
  }
}
