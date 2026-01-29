import { NextResponse } from 'next/server'
import { config } from '@/config'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Call actual backend
        const backendRes = await fetch(`${config.apiUrl}/api/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await backendRes.json()

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: data.message || 'Login failed' },
                { status: backendRes.status }
            )
        }

        // Prepare response
        const response = NextResponse.json({
            success: true,
            data: {
                user: data.data.user || data.data, // Adjust based on actual backend response structure
                // Do NOT send token back to client body if strictly HttpOnly
                // But we might need it for initial state if auth-store requires it temporarily
                // For now, we omit it to strictly follow HttpOnly goal
            }
        })

        // Set HttpOnly Cookies
        const token = data.data.token || data.token // Adjust based on actual response
        const userRole = data.data.user?.role || data.data.role || 'User'
        const userName = data.data.user?.fullName || data.data.fullName || 'User'

        // Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        }

        // 1. Auth Token (HttpOnly, Secure) - The sensitive one
        response.cookies.set('auth_token', token, cookieOptions)

        // 2. Public Cookies (For UI hydration, NOT HttpOnly)
        // allowing JS to read these to know user role/name without making an API call immediately
        response.cookies.set('user_role', userRole, { ...cookieOptions, httpOnly: false })
        response.cookies.set('user_name', encodeURIComponent(userName), { ...cookieOptions, httpOnly: false })

        return response

    } catch (error) {
        console.error('Login Proxy Error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
