/**
 * Auth API Service
 * Handles authentication API calls with proper error handling and sanitization
 */

import { config } from '@/config'
import { handleApiResponse } from '@/utils/error-handler'
import { sanitizeEmail } from '@/utils/sanitization'
import { apiClient } from '@/lib/api-client'
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
import { RegisterEnterpriseData, CreateHRAccountData } from '../schemas/auth-schemas'

interface ApiResponse<T> {
    message: string;
    data?: T;
    success?: boolean;
}



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
    // Use local proxy route to handle HttpOnly cookies
    const response = await apiClient.post('/api/auth/session/login', sanitizedData)
    return handleApiResponse<LoginResponse>(response, 'Đăng nhập thất bại')
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const sanitizedData = sanitizeRegisterRequest(data)
    const response = await apiClient.post('/api/Auth/register', {
        email: sanitizedData.email,
        password: sanitizedData.password,
        fullName: sanitizedData.fullName,
        role: sanitizedData.role,
    })
    return handleApiResponse<RegisterResponse>(response, 'Đăng ký thất bại')
}

/**
 * Request password reset
 */
export async function forgotPassword(
    data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
    const sanitizedData = sanitizeForgotPasswordRequest(data)
    const response = await apiClient.post('/api/Auth/forgot-password', sanitizedData)
    return handleApiResponse<ForgotPasswordResponse>(response, 'Không thể gửi email đặt lại mật khẩu')
}

/**
 * Reset password
 */
export async function resetPassword(
    data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
    const payload = {
        email: sanitizeEmail(data.email),
        token: data.token,
        newPassword: data.newPassword.trim(),
    }
    const response = await apiClient.post('/api/Auth/reset-password', payload)
    return handleApiResponse<ResetPasswordResponse>(response, 'Đặt lại mật khẩu thất bại')
}

/**
 * Change password
 */
export async function changePassword(
    data: ChangePasswordRequest
): Promise<ApiResponse<string>> {
    const response = await apiClient.put('/api/Auth/change-password', {
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim()
    })

    return handleApiResponse<ApiResponse<string>>(response, 'Đổi mật khẩu thất bại')
}

/**
 * Register Enterprise (Step 1)
 */
export async function registerEnterprise(data: RegisterEnterpriseData): Promise<{ enterpriseId: string }> {
    const response = await apiClient.post('/api/Auth/register-enterprise', data)
    return handleApiResponse<{ enterpriseId: string }>(response, 'Đăng ký doanh nghiệp thất bại')
}

/**
 * Create HR Account (Step 3)
 */
export async function createHRAccount(data: CreateHRAccountData & { enterpriseId: string }): Promise<{ userId: string }> {
    const response = await apiClient.post('/api/Auth/create-hr-account', data)
    return handleApiResponse<{ userId: string }>(response, 'Tạo tài khoản HR thất bại')
}

/**
 * Confirm Email (from email link)
 */
export async function confirmEmail(userId: string, token: string): Promise<{ message: string; token?: string }> {
    const response = await apiClient.post('/api/Auth/confirm-email', { userId, token })
    return handleApiResponse<{ message: string; token?: string }>(response, 'Xác thực email thất bại')
}

/**
 * Resend Confirmation Email
 */
export async function resendConfirmation(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/Auth/resend-confirmation', { email: sanitizeEmail(email) })
    return handleApiResponse<{ message: string }>(response, 'Gửi lại email xác thực thất bại')
}

// Default export for backward compatibility if needed, but preferable to use named exports
export const authService = {
    login,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    registerEnterprise,
    createHRAccount,
    confirmEmail,
    resendConfirmation
}
