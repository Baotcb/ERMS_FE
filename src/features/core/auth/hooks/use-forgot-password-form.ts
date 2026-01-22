/**
 * Custom hook for forgot password form logic
 * Handles form state, validation, and submission using React Hook Form + Zod
 */

'use client'

import { useFormHandler } from '@/hooks/use-form-handler'
import { forgotPassword } from '../api/auth-service'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/auth-schemas'
import { useToast } from '@/hooks/use-toast'

export function useForgotPasswordForm() {
  const { toast } = useToast()

  const formHandler = useFormHandler({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    const response = await forgotPassword({
      email: data.email,
    })

    toast({
      title: "Thành công",
      description: response.message || 'Email đặt lại mật khẩu đã được gửi!',
      variant: 'default',
      className: 'bg-green-500 text-white border-none',
    })
  }

  return {
    ...formHandler,
    handleSubmit: formHandler.handleSubmit(handleSubmit),
  }
}
