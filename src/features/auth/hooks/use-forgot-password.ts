import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/auth/service'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../types'

export const useForgotPassword = () => {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    })

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsLoading(true)
            setError(null)

            await authService.forgotPassword(data.email)

            toast({
                title: 'Request sent successfully',
                description: 'If the email exists, a password reset link has been sent. You will be redirected to the login page in 3 seconds.',
            })

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err) {
            console.error('Forgot password error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        form,
        isLoading,
        error,
        onSubmit: form.handleSubmit(handleSubmit)
    }
}
