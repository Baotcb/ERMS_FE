import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT decode function for Edge Runtime
function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

export function middleware(request: NextRequest) {
    // Only run on /recruitment/hr routes
    if (!request.nextUrl.pathname.startsWith('/recruitment/hr')) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')?.value

    // 1. Check if token exists
    if (!token) {
        const loginUrl = new URL('/login', request.url)
        // Store return URL to redirect back after login
        loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // 2. Decode token to check role
    const payload = decodeJwt(token)

    if (!payload) {
        // Invalid token
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Role claim key can vary (mapped in backend or standard)
    // Checking multiple possibilities as per utils.ts
    const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
        payload['role'] ||
        payload['Role'] ||
        'guest'

    // 3. Check Role Permissions
    // Only Manager and Admin can access HR area
    const allowedRoles = ['Manager', 'Admin']
    const hasAccess = allowedRoles.some(r => role === r || (Array.isArray(role) && role.includes(r)))

    if (!hasAccess) {
        // Redirect to unauthorized or home
        // For candidates, maybe redirect to candidate portal
        if (role === 'Candidate') {
            return NextResponse.redirect(new URL('/recruitment/candidate', request.url))
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/recruitment/hr/:path*'],
}
