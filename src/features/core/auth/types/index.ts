
import { User } from '@/stores/auth-store'

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
    expiration?: string
    refreshToken?: string
}

export interface RegisterRequest {
    email: string
    password: string
    fullName: string
    role?: string
}

export interface RegisterResponse {
    message: string
    user?: User
    token?: string // In case auto-login
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ForgotPasswordResponse {
    message: string
}

export interface ResetPasswordRequest {
    email: string
    token: string
    newPassword: string
}

export interface ResetPasswordResponse {
    message: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface GoogleLoginRequest {
    Email: string
    FullName: string
}

export interface GoogleLoginResponse {
    token: string
}
