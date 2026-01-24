'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { parseJwt } from '@/utils/jwt'
import { Loader2 } from 'lucide-react'

export default function CallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login: authLogin } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (error) {
            router.push(`/login?error=${error}`)
            return
        }

        if (token) {
            try {
                // Parse token to get user info
                const decodedToken = parseJwt(token)
                const role = String(
                    decodedToken?.role ||
                    decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                    ''
                )
                const userId = String(decodedToken?.nameid || decodedToken?.sub || 'unknown')
                const email = String(decodedToken?.email || '')

                // Create user object
                const user = {
                    id: userId,
                    email: email,
                    fullName: email.split('@')[0],
                    role: role || undefined
                }

                // Update global auth state
                authLogin(token, user, false)

                // Set cookies for middleware authentication
                document.cookie = `auth_token=${token}; path=/; SameSite=Lax`
                document.cookie = `user_role=${role}; path=/; SameSite=Lax`

                // Redirect after short delay for UX
                setTimeout(() => {
                    if (role === 'Candidate') {
                        router.push('/candidate/jobs')
                    } else {
                        router.push('/offers')
                    }
                }, 500)
            } catch (err) {
                console.error('Token parse error:', err)
                router.push('/login?error=invalid_token')
            }
        } else {
            router.push('/login?error=no_token')
        }
    }, [searchParams, router, authLogin])

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
    )
}
