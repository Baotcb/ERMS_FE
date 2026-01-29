/**
 * Auth API Service
 * Handles authentication API calls with proper error handling and sanitization
 */

import { config } from '@/config'
import { handleApiResponse } from '@/utils/error-handler'
import { sanitizeEmail } from '@/utils/sanitization'
import { getCookie } from '../utils/auth-cookies'
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
    GoogleLoginRequest,
} from '../types'

interface ApiResponse<T> {
    message: string;
    data?: T;
    success?: boolean;
}

interface GoogleTokenResponse {
    id_token: string;
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
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
    const token = getCookie('auth_token');

    if (!token) {
        throw new Error('Không tìm thấy token xác thực');
    }

    const response = await fetch(`${API_BASE}/api/Auth/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            currentPassword: data.currentPassword.trim(),
            newPassword: data.newPassword.trim()
        }),
    })

    const result = await handleApiResponse<ApiResponse<string>>(
        response,
        'Đổi mật khẩu thất bại'
    )
    return result;
}

/**
 * Login with Google
 */
export async function loginByGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/Auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    return handleApiResponse<LoginResponse>(
        response,
        'Đăng nhập Google thất bại'
    )
}

/**
 * Exchange OAuth authorization code for tokens
 * This must be called from a server-side environment (Route Handler/Server Action)
 */
export async function exchangeCodeForTokens(code: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
            grant_type: 'authorization_code',
        }),
    });

    const data: GoogleTokenResponse = await response.json();

    if (!response.ok) {
        console.error('Google token exchange error:', data);
        throw new Error(data.error_description || 'Failed to exchange code for tokens');
    }

    return data.id_token;
}

// Default export for backward compatibility if needed, but preferable to use named exports
export const authService = {
    login,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    loginByGoogle,
    exchangeCodeForTokens
}
