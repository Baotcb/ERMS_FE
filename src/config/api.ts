const envApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

if (!envApiUrl) {
    throw new Error('API_URL environment variable must be configured')
}

export const API_URL: string = envApiUrl
