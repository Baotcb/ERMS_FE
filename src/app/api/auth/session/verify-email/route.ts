import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_OPTIONS } from '@/utils/constants'

const COOKIE_NAME = 'verify_email'

/**
 * POST - Set verify_email cookie (stores email for verify page)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        const response = NextResponse.json({ success: true })
        response.cookies.set(COOKIE_NAME, email || '', {
            ...COOKIE_OPTIONS,
            httpOnly: true,
            maxAge: 60 * 30, // 30 minutes
        })

        return response
    } catch (error) {
        console.error('Set verify email cookie error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE - Clear verify_email cookie
 */
export async function DELETE() {
    try {
        const response = NextResponse.json({ success: true })
        response.cookies.delete(COOKIE_NAME)
        return response
    } catch (error) {
        console.error('Clear verify email cookie error:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
