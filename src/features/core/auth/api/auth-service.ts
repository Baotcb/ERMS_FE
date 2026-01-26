/**
 * Auth API Service
 * Handles authentication API calls with proper error handling and sanitization
 */

import { config } from '@/config'
import { handleApiResponse } from '@/utils/error-handler'
import { sanitizeEmail } from '@/utils/sanitization'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    ChangePasswordRequest,
} from '../types'

interface ApiResponse<T> {
    message: string;
    data?: T;
    success?: boolean;
}

const API_BASE = config.apiUrl

/**
 * Sanitize login request data
 */
function sanitizeLoginRequest(data: LoginRequest): LoginRequest {
    return {
        email: sanitizeEmail(data.email),
        password: data.password.trim(),
    }
}

/**
 * Sanitize register request data
 */
function sanitizeRegisterRequest(data: RegisterRequest): RegisterRequest {
    return {
        email: sanitizeEmail(data.email),
        password: data.password.trim(),
        fullName: data.fullName.trim(),
        role: data.role || 'Candidate',
    }
}

/**
 * Sanitize forgot password request data
 */
function sanitizeForgotPasswordRequest(
    data: ForgotPasswordRequest
): ForgotPasswordRequest {
    return {
        email: sanitizeEmail(data.email),
    }
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const sanitizedData = sanitizeLoginRequest(data)

    const response = await fetch(`${API_BASE}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
    })

    return handleApiResponse<LoginResponse>(
        response,
        'Đăng nhập thất bại'
    )
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const sanitizedData = sanitizeRegisterRequest(data)

    const response = await fetch(`${API_BASE}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: sanitizedData.email,
            password: sanitizedData.password,
            fullName: sanitizedData.fullName,
            role: sanitizedData.role,
        }),
    })

    return handleApiResponse<RegisterResponse>(
        response,
        'Đăng ký thất bại'
    )
}

/**
 * Request password reset
 */
export async function forgotPassword(
    data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
    const sanitizedData = sanitizeForgotPasswordRequest(data)

    const response = await fetch(`${API_BASE}/api/Auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
    })

    return handleApiResponse<ForgotPasswordResponse>(
        response,
        'Không thể gửi email đặt lại mật khẩu'
    )
}

/**
 * Reset password
 */
export async function resetPassword(
    data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
    // Basic sanitization if needed, mostly passing through
    const payload = {
        email: sanitizeEmail(data.email),
        token: data.token,
        newPassword: data.newPassword.trim(),
    }

    const response = await fetch(`${API_BASE}/api/Auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    return handleApiResponse<ResetPasswordResponse>(
        response,
        'Đặt lại mật khẩu thất bại'
    )
}

/**
 * Change password
 */
export async function changePassword(
    data: ChangePasswordRequest
): Promise<ApiResponse<string>> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE}/api/Auth/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        }),
    })

    const result = await handleApiResponse<ApiResponse<string>>(
        response,
        'Đổi mật khẩu thất bại'
    )
    return result;
}

// Default export for backward compatibility if needed, but preferable to use named exports
export const authService = {
    login,
    register,
    forgotPassword,
    resetPassword,
    changePassword
}
