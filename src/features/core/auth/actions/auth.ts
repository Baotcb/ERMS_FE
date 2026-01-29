'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginFormData } from '../schemas/auth-schemas'

interface LoginResult {
    success: boolean
    error?: string
    user?: {
        role?: string
        fullName?: string
        id?: string
        email?: string
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ermsbe-dcbtdfezebashgb7.southeastasia-01.azurewebsites.net'

export async function loginAction(data: LoginFormData): Promise<LoginResult> {
    const { email, password, rememberMe } = data

    if (!email || !password) {
        return { success: false, error: 'Vui lòng nhập email và mật khẩu' }
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const resData = await res.json()

        if (!res.ok) {
            return { success: false, error: resData.message || 'Đăng nhập thất bại' }
        }

        // Set HttpOnly Cookie
        const cookieStore = await cookies()
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day

        // Store Auth Token
        cookieStore.set('auth_token', resData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge,
        })

        // Parse token or use returned user data to get role/name
        // Assuming backend returns user object, if not we might need to decode token (but simple decode here is flaky without library or polyfill, 
        // better if backend returns it. The login-form used to decode.
        // Let's assume resData.user exists or valid parsing logic.
        // Actually, looking at login-form, it decoded the token.
        // We can decode the token on the server side easily enough if needed, but let's see if we can get user info.
        // If backend doesn't return user, we decode.

        // Simple base64 decode for server side
        let role = ''
        let fullName = email.split('@')[0]
        let userId = ''

        if (resData.token) {
            try {
                const parts = resData.token.split('.')
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
                    role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || ''
                    userId = payload.nameid || payload.sub || ''
                    // We might fetch profile here if we want exact fullName, but let's stick to basic or what Client passed?
                    // Client fetched profile. We can do that here too to be secure/consistent.
                }
            } catch (e) {
                console.error('Token decode error', e)
            }
        }

        // Store minimal user info for middleware/client
        if (role) {
            cookieStore.set('user_role', role, {
                path: '/',
                maxAge,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
        }

        // Check if we need to fetch profile for full name
        // Fetching profile requires the token we just got
        try {
            const profileRes = await fetch(`${API_URL}/api/UserProfile/me`, {
                headers: { 'Authorization': `Bearer ${resData.token}` }
            })
            if (profileRes.ok) {
                const profile = await profileRes.json()
                if (profile.fullName) fullName = profile.fullName
            }
        } catch {
            // ignore profile fetch error
        }

        cookieStore.set('user_name', encodeURIComponent(fullName), {
            path: '/',
            maxAge,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        return {
            success: true,
            user: {
                id: userId,
                email,
                fullName,
                role
            }
        }
    } catch (error) {
        console.error('Login action error:', error)
        return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại sau' }
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    cookieStore.delete('user_role')
    cookieStore.delete('user_name')
    redirect('/login')
}
