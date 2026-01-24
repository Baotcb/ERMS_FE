'use client'

import { useEffect } from 'react'
import { parseJwt } from '@/utils/jwt'

export default function GoogleCallbackPopupPage() {
    useEffect(() => {
        const processGoogleCallback = () => {
            try {
                // Get token from URL parameters (backend redirects here with token)
                const params = new URLSearchParams(window.location.search)
                const token = params.get('token')
                const error = params.get('error')

                if (error) {
                    // Handle error case
                    window.opener?.postMessage({
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'Đăng nhập Google thất bại'
                    }, window.location.origin)
                    setTimeout(() => window.close(), 1000)
                    return
                }

                if (token) {
                    // Parse token to get user info
                    const decodedToken = parseJwt(token)
                    const role = String(decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Candidate')

                    // Send success message to parent window using postMessage
                    window.opener?.postMessage({
                        type: 'GOOGLE_LOGIN_SUCCESS',
                        token: token,
                        role: role
                    }, window.location.origin)

                    setTimeout(() => window.close(), 500)
                } else {
                    // No token in URL - error
                    window.opener?.postMessage({
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'Không nhận được token từ Google'
                    }, window.location.origin)
                    setTimeout(() => window.close(), 1000)
                }

            } catch (error) {
                window.opener?.postMessage({
                    type: 'GOOGLE_LOGIN_ERROR',
                    error: 'Lỗi xử lý đăng nhập Google'
                }, window.location.origin)
                setTimeout(() => window.close(), 1000)
            }
        }

        processGoogleCallback()
    }, [])

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang hoàn tất đăng nhập Google...</p>
            </div>
        </div>
    )
}

