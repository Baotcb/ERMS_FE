import { NextResponse } from 'next/server'
import { config } from '@/config'
import { COOKIE_OPTIONS, STORAGE_KEYS } from '@/utils/constants'
import { parseJwt } from '@/utils/jwt'

interface BackendLoginResponse {
    message?: string
    token?: string
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

function normalizeErrorText(value: string) {
    return value.replace(/\s+/g, ' ').trim()
}

async function parseBackendResponse(response: Response): Promise<BackendLoginResponse> {
    const rawText = await response.text()

    if (!rawText) {
        return {}
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('json')) {
        try {
            const parsed = JSON.parse(rawText) as {
                message?: unknown
                token?: unknown
            }

            return {
                message: typeof parsed.message === 'string' ? parsed.message : undefined,
                token: typeof parsed.token === 'string' ? parsed.token : undefined,
            }
        } catch {
            console.error('Login proxy received invalid JSON payload from backend.', {
                status: response.status,
                contentType,
                preview: normalizeErrorText(rawText).slice(0, 180),
            })

            return {}
        }
    }

    const normalizedText = normalizeErrorText(rawText)
    const lowerText = normalizedText.toLowerCase()
    const looksLikeHtmlOrScript =
        lowerText.includes('<!doctype html') ||
        lowerText.includes('<html') ||
        lowerText.includes('<script') ||
        lowerText.includes('window.__next') ||
        lowerText.includes('webpack') ||
        lowerText.includes('sourcemappingurl')

    if (!looksLikeHtmlOrScript && normalizedText.length <= 240) {
        return {
            message: normalizedText,
        }
    }

    console.error('Login proxy received unexpected non-JSON payload from backend.', {
        status: response.status,
        contentType,
        preview: normalizedText.slice(0, 180),
    })

    return {}
}

function getLoginFallbackMessage(status: number) {
    if (status === 400 || status === 401) {
        return 'Dang nhap that bai. Vui long kiem tra email/ten dang nhap va mat khau.'
    }

    if (status === 429) {
        return 'Ban da dang nhap sai qua nhieu lan. Vui long thu lai sau 1 phut.'
    }

    if (status === 502 || status === 503 || status === 504) {
        return 'Khong the ket noi dich vu dang nhap. Vui long thu lai sau.'
    }

    return 'Dang nhap that bai. Vui long thu lai.'
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

        const data = await parseBackendResponse(backendRes)

        if (!backendRes.ok) {
            const message = data.message || getLoginFallbackMessage(backendRes.status)

            return NextResponse.json(
                { message },
                { status: backendRes.status }
            )
        }

        if (!data.token || typeof data.token !== 'string') {
            return NextResponse.json(
                { message: 'Login response is missing token.' },
                { status: 502 }
            )
        }

        // Backend only returns { token } - decode JWT to extract user info
        const token = data.token

        // Decode JWT payload
        let userId = ''
        let userRole = 'User'
        let userName = ''
        let userEmail = email
        let userAvatar = ''
        try {
            const payload = parseJwt(token)
            if (payload) {
                userId = String(payload.nameid || payload.sub || '')
                userRole = String(
                    payload.role
                    || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                    || 'User'
                )
                userName = String(
                    payload.given_name
                    || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                    || ''
                )
                userEmail = String(
                    payload.email
                    || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
                    || email
                )
            }
        } catch {
            // Keep fallback values when token payload cannot be decoded.
        }

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
                    id: userId,
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
        if (userId) {
            response.cookies.set(STORAGE_KEYS.USER_ID, userId, { ...cookieOptions, httpOnly: false })
        }
        if (userEmail) {
            response.cookies.set(STORAGE_KEYS.USER_EMAIL, encodeURIComponent(userEmail), { ...cookieOptions, httpOnly: false })
        }
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
