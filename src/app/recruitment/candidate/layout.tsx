'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login')
                return
            }

            // Check if user has candidate role
            // We normalize to lowercase to be safe
            const role = user?.role?.toLowerCase()
            if (role !== 'candidate') {
                // If HR or other tries to access, redirect them
                // You might want to show a toast or alert here in a real app
                router.push('/recruitment')
            }
        }
    }, [user, isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Double check render protection to avoid flash of content
    if (!isAuthenticated || user?.role?.toLowerCase() !== 'candidate') {
        return null
    }

    return <>{children}</>
}
