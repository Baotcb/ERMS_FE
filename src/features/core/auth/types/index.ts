// Auth feature types
// ... (content same as before, simplified for restoration)
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { token: string }
export interface RegisterRequest { email: string; password: string; fullName: string; role?: string }
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface RegisterResponse { message: string; userId: string }
export interface ForgotPasswordRequest { email: string }
export interface ForgotPasswordResponse { message: string }
export interface ResetPasswordRequest { email: string; token: string; newPassword: string }
export interface ResetPasswordResponse { message: string }
export interface AuthError { message: string }
