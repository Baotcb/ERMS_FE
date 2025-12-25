import { JWTPayload } from './types'

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeJWT(token: string): JWTPayload | null {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('Error decoding JWT:', error)
        return null
    }
}

/**
 * Extract user info from JWT token
 */
export function extractUserFromToken(token: string) {
    const payload = decodeJWT(token)
    if (!payload) return null

    return {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    }
}
