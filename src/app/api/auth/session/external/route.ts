import { NextResponse } from 'next/server'
import { config } from '@/config'
import { COOKIE_OPTIONS, STORAGE_KEYS } from '@/utils/constants'

async function fetchProfileSnapshot(token: string) {
    try {
        const response = await fetch(`${config.apiUrl}/api/User/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
            return null
        }

        return await response.json() as {
            fullName?: string
            avatarUrl?: string | null
        }
    } catch {
        return null
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, role, user } = body

        if (!token || !role || !user) {
            return NextResponse.json(
                { message: 'Missing token or user data' },
                { status: 400 }
            )
        }

        const response = NextResponse.json({ success: true })

        // Cookie options
        const cookieOptions = {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        }

        // Set HttpOnly Cookies
        response.cookies.set(STORAGE_KEYS.AUTH_TOKEN, token, { ...cookieOptions, httpOnly: true })

        const profile = await fetchProfileSnapshot(token)
        const displayName = profile?.fullName || user.fullName || ''
        const avatarUrl = profile?.avatarUrl || user.avatarUrl || ''

        // Set Public Cookies
        response.cookies.set(STORAGE_KEYS.USER_ROLE, role, { ...cookieOptions, httpOnly: false })
        if (displayName) {
            response.cookies.set(STORAGE_KEYS.USER_NAME, encodeURIComponent(displayName), { ...cookieOptions, httpOnly: false })
        }
        if (avatarUrl) {
            response.cookies.set(STORAGE_KEYS.USER_AVATAR, encodeURIComponent(avatarUrl), { ...cookieOptions, httpOnly: false })
        } else {
            response.cookies.delete(STORAGE_KEYS.USER_AVATAR)
        }

        return response

    } catch (error) {
        console.error('External Session Error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
