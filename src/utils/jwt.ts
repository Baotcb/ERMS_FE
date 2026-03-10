import { logger } from '@/utils/logger'

export interface DecodedToken {
    sub: string
    email: string
    role: string
    exp: number
    iat: number
    [key: string]: string | number
}

function decodeBase64Url(value: string): string {
    const normalized = value
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(value.length / 4) * 4, '=')

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(normalized, 'base64').toString('utf-8')
    }

    return decodeURIComponent(
        atob(normalized)
            .split('')
            .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
    )
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

        return JSON.parse(decodeBase64Url(base64Url))
    } catch (error) {
        logger.error('Failed to parse JWT token', error)
        return null
    }
}
