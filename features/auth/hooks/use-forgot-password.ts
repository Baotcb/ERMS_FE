import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../types'

export const useForgotPassword = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError()
      await forgotPassword(data.email)

      toast({
        title: 'Request sent successfully',
        description: 'If the email exists, a password reset link has been sent. You will be redirected to the login page in 3 seconds.',
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      // Error is already handled by the store and displayed via toast
      console.error('Forgot password error:', err)
    }
  }

  return {
    form,
    isLoading,
    error,
    onSubmit: form.handleSubmit(handleSubmit)
  }
}
