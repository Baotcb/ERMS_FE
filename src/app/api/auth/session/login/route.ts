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

        // Backend only returns { token } - decode JWT to extract user info
        const token = data.token

        // Decode JWT payload
        let userRole = 'User'
        let userName = ''
        let userEmail = email
        let userAvatar = ''
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userRole = payload.role
                || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                || 'User'
            userName = payload.given_name
                || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                || ''
            userEmail = payload.email
                || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
                || email
        } catch { /* fallback to defaults */ }

        const profile = await fetchProfileSnapshot(token)
        if (profile?.fullName) {
            userName = profile.fullName
        }
        userAvatar = profile?.avatarUrl || ''

        // Prepare response with user info for FE auth store
        const response = NextResponse.json({
            success: true,
            data: {
                user: {
                    email: userEmail,
                    fullName: userName,
                    role: userRole,
                    avatarUrl: userAvatar,
                },
            }
        })

        // Cookie options
        const cookieOptions = {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        }

        // 1. Auth Token (HttpOnly, Secure)
        response.cookies.set(STORAGE_KEYS.AUTH_TOKEN, token, { ...cookieOptions, httpOnly: true })

        // 2. Public Cookies (For UI hydration)
        response.cookies.set(STORAGE_KEYS.USER_ROLE, userRole, { ...cookieOptions, httpOnly: false })
        if (userName) {
            response.cookies.set(STORAGE_KEYS.USER_NAME, encodeURIComponent(userName), { ...cookieOptions, httpOnly: false })
        }
        if (userAvatar) {
            response.cookies.set(STORAGE_KEYS.USER_AVATAR, encodeURIComponent(userAvatar), { ...cookieOptions, httpOnly: false })
        } else {
            response.cookies.delete(STORAGE_KEYS.USER_AVATAR)
        }

        return response

    } catch (error) {
        console.error('Login Proxy Error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
