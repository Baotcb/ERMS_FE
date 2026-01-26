'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseJwt } from '@/utils/jwt'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { User } from '@/stores/auth-store'

export default function GoogleCallbackPage() {
    const router = useRouter()
    const { login: authLogin } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get token from URL parameters (backend redirects here with token)
                const params = new URLSearchParams(window.location.search)
                const token = params.get('token')
                const error = params.get('error')

                if (error) {
                    // Redirect to login with error
                    router.push(`/login?error=${encodeURIComponent(error || 'Google login failed')}`)
                    return
                }

                if (!token) {
                    router.push('/login?error=' + encodeURIComponent('No token received'))
                    return
                }

                // Parse token to get user info
                const decodedToken = parseJwt(token)
                const role = String(decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Candidate')
                const userId = String(decodedToken?.nameid || decodedToken?.sub || 'unknown')

                // Construct user object
                const user: User = {
                    id: userId,
                    email: decodedToken?.email || '',
                    fullName: String(decodedToken?.name || ''),
                    role: role ? String(role) : undefined
                }

                // Update global auth state
                authLogin(token, user, false)

                // Set cookies
                document.cookie = `auth_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`
                document.cookie = `user_role=${role}; path=/; max-age=${7*24*60*60}; SameSite=Lax`

                // Redirect based on role
                if (role === 'Candidate') {
                    router.push('/candidate/jobs')
                } else {
                    router.push('/offers')
                }
            } catch (error) {
                router.push('/login?error=' + encodeURIComponent('Failed to process Google login'))
            }
        }

        handleCallback()
    }, [router, authLogin])

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang hoàn tất đăng nhập Google...</p>
            </div>
        </div>
    )
}
