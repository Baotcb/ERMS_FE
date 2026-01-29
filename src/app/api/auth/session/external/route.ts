import { NextResponse } from 'next/server'
import { COOKIE_OPTIONS, STORAGE_KEYS } from '@/utils/constants'

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

        // Set Public Cookies
        response.cookies.set(STORAGE_KEYS.USER_ROLE, role, { ...cookieOptions, httpOnly: false })
        const displayName = user.fullName || user.email?.split('@')[0] || 'User'
        response.cookies.set(STORAGE_KEYS.USER_NAME, encodeURIComponent(displayName), { ...cookieOptions, httpOnly: false })

        return response

    } catch (error) {
        console.error('External Session Error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
