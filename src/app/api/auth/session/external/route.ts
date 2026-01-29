import { NextResponse } from 'next/server'

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
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        }

        // Set HttpOnly Cookies
        response.cookies.set('auth_token', token, cookieOptions)

        // Set Public Cookies
        response.cookies.set('user_role', role, { ...cookieOptions, httpOnly: false })
        const displayName = user.fullName || user.email?.split('@')[0] || 'User'
        response.cookies.set('user_name', encodeURIComponent(displayName), { ...cookieOptions, httpOnly: false })

        return response

    } catch (error) {
        console.error('External Session Error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
