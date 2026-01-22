import { logger } from '@/utils/logger'

export interface DecodedToken {
    sub: string
    email: string
    role: string
    exp: number
    iat: number
    [key: string]: string | number
}

export function parseJwt(token: string): DecodedToken | null {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                })
                .join('')
        )

        return JSON.parse(jsonPayload)
    } catch (error) {
        logger.error('Failed to parse JWT token', error)
        return null
    }
}
