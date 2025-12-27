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


    const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
        payload['role'] ||
        payload['Role'] ||
        'guest';

    return {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['nameid'] || '',
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['unique_name'] || '',
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload['email'] || '',
        role: role,
        fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['unique_name'] || '',
    }
}
