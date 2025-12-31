import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/stores/auth-store'
import { resetPasswordSchema, type ResetPasswordFormData } from '../types'

export const useResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { resetPassword, isLoading, error, clearError } = useAuthStore()

  // Get email and token from URL parameters
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Update form values when URL params change
  useEffect(() => {
    form.setValue('email', email)
    form.setValue('token', token)
  }, [email, token, form])

  const handleSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError()
      await resetPassword({
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })

      toast({
        title: 'Đặt lại mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được đặt lại. Bạn sẽ được chuyển hướng về trang đăng nhập sau 3 giây.',
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      // Error is already handled by the store and displayed via toast
      console.error('Reset password error:', err)
    }
  }

  return {
    form,
    isLoading,
    error,
    email,
    token,
    onSubmit: form.handleSubmit(handleSubmit)
  }
}
