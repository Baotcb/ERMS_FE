'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginFormData, EmployerRegisterFormData } from '../schemas/auth-schemas'

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
        console.log('Login attempt for:', email)
        console.log('Using API URL:', API_URL)
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        // Handle empty response body gracefully (backend may return empty body on error)
        const resText = await res.text()
        console.log('Login response status:', res.status)
        console.log('Login response body:', resText)

        let resData: { message?: string; token?: string; user?: { role?: string; fullName?: string; id?: string; email?: string } } = {}
        if (resText) {
            try {
                resData = JSON.parse(resText)
            } catch {
                console.error('Failed to parse login response JSON')
                return { success: false, error: 'Phản hồi từ server không hợp lệ' }
            }
        }

        if (!res.ok) {
            console.error('Login failed with status:', res.status, 'Message:', resData.message)
            return { success: false, error: (resData.message as string) || 'Đăng nhập thất bại' }
        }

        // Set HttpOnly Cookie
        const cookieStore = await cookies()
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day

        if (!resData.token) {
            console.error('No token in response:', resData)
            return { success: false, error: 'Không nhận được token từ server' }
        }

        // Store Auth Token
        cookieStore.set('auth_token', resData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge,
        })

        // Parse token or use returned user data to get role/name
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

export async function registerEmployerAction(data: EmployerRegisterFormData): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${API_URL}/api/Auth/register-enterprise`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        const resData = await response.json()

        if (!response.ok) {
            return { success: false, error: resData.message || 'Đăng ký thất bại' }
        }

        return { success: true }
    } catch (error) {
        console.error('Register employer error:', error)
        return { success: false, error: 'Không thể kết nối đến máy chủ' }
    }
}
