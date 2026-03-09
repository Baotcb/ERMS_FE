'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginFormData, EmployerRegisterFormData } from '../schemas/auth-schemas'
import { config } from '@/config'
import { logger } from '@/lib/logger'
import { COOKIE_OPTIONS, STORAGE_KEYS } from '@/utils/constants'
import { parseJwt } from '@/utils/jwt'

interface LoginResult {
    success: boolean
    error?: string
    user?: {
        role?: string
        fullName?: string
        id?: string
        email?: string
        avatarUrl?: string
    }
}

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

export async function loginAction(data: LoginFormData): Promise<LoginResult> {
    const { email, password, rememberMe } = data

    if (!email || !password) {
        return { success: false, error: 'Vui lòng nhập email và mật khẩu' }
    }

    try {
        logger.debug('Login attempt initiated')

        const res = await fetch(`${config.apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        // Handle empty response body gracefully (backend may return empty body on error)
        const resText = await res.text()

        let resData: { message?: string; token?: string; user?: { role?: string; fullName?: string; id?: string; email?: string } } = {}
        if (resText) {
            try {
                resData = JSON.parse(resText)
            } catch {
                logger.error('Failed to parse login response JSON')
                return { success: false, error: 'Phản hồi từ server không hợp lệ' }
            }
        }

        if (!res.ok) {
            logger.error('Login failed with status:', res.status)
            return { success: false, error: (resData.message as string) || 'Đăng nhập thất bại' }
        }

        // Set HttpOnly Cookie
        const cookieStore = await cookies()
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
        const cookieSettings = {
            ...COOKIE_OPTIONS,
            maxAge,
        }

        if (!resData.token) {
            logger.error('No token in response')
            return { success: false, error: 'Không nhận được token từ server' }
        }

        // Store Auth Token
        cookieStore.set(STORAGE_KEYS.AUTH_TOKEN, resData.token, {
            ...cookieSettings,
            httpOnly: true,
        })

        // Parse token or use returned user data to get role/name
        let role = ''
        let fullName = ''
        let userId = ''
        let avatarUrl = ''

        if (resData.token) {
            try {
                const payload = parseJwt(resData.token)
                if (payload) {
                    role = String(payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '')
                    userId = String(payload.nameid || payload.sub || '')
                    // Get fullName from JWT GivenName claim (set by TokenService)
                    fullName = String(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '')
                }
            } catch (e) {
                logger.error('Token decode error', e)
            }
        }

        // Store minimal user info for middleware/client
        if (role) {
            cookieStore.set(STORAGE_KEYS.USER_ROLE, role, cookieSettings)
        }

        const profile = await fetchProfileSnapshot(resData.token)
        if (profile?.fullName) {
            fullName = profile.fullName
        }
        avatarUrl = profile?.avatarUrl || ''

        if (fullName) {
            cookieStore.set(STORAGE_KEYS.USER_NAME, encodeURIComponent(fullName), cookieSettings)
        }

        if (avatarUrl) {
            cookieStore.set(STORAGE_KEYS.USER_AVATAR, encodeURIComponent(avatarUrl), cookieSettings)
        } else {
            cookieStore.delete(STORAGE_KEYS.USER_AVATAR)
        }

        return {
            success: true,
            user: {
                id: userId,
                email,
                fullName,
                role,
                avatarUrl,
            }
        }
    } catch (error) {
        logger.error('Login action error:', error)
        return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại sau' }
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete(STORAGE_KEYS.AUTH_TOKEN)
    cookieStore.delete(STORAGE_KEYS.USER_ROLE)
    cookieStore.delete(STORAGE_KEYS.USER_NAME)
    cookieStore.delete(STORAGE_KEYS.USER_AVATAR)
    redirect('/login')
}

export async function registerEmployerAction(data: EmployerRegisterFormData): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${config.apiUrl}/api/Auth/register-enterprise`, {
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
        logger.error('Register employer error:', error)
        return { success: false, error: 'Không thể kết nối đến máy chủ' }
    }
}
