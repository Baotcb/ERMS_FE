export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    fullName: string
    role?: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface AuthResponse {
    token?: string
    user?: {
        id: string
        email: string
        fullName: string
        role: string
    }
    message?: string
    success?: boolean
    userId?: string
}

export interface JWTPayload {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'?: string
    role?: string
    Role?: string
    nameid?: string
    unique_name?: string
    email?: string
    exp: number
    iss: string
    aud: string
}
