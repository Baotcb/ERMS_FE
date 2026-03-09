import { NextResponse } from 'next/server'
import { STORAGE_KEYS } from '@/utils/constants'

export async function POST() {
    const response = NextResponse.json({ success: true })

    // Clear all auth cookies
    response.cookies.delete(STORAGE_KEYS.AUTH_TOKEN)
    response.cookies.delete(STORAGE_KEYS.USER_ROLE)
    response.cookies.delete(STORAGE_KEYS.USER_NAME)
    response.cookies.delete(STORAGE_KEYS.USER_AVATAR)

    return response
}
