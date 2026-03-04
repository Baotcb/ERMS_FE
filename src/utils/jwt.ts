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
        const parts = token.split('.')
        if (parts.length !== 3) {
            logger.error('Invalid JWT format: token does not have 3 parts')
            return null
        }

        const base64Url = parts[1]
        if (!base64Url) {
            logger.error('Invalid JWT format: missing payload')
            return null
        }

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
