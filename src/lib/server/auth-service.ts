/**
 * Server-Side Auth Service
 * Handles authentication operations from server
 */

import { serverFetch } from '../server-fetch';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface RegisterResponse {
  token: string;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Login from server
 */
export async function loginServer(data: LoginRequest): Promise<LoginResponse> {
  return serverFetch<LoginResponse>('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email.trim(),
      password: data.password,
    }),
  });
}

/**
 * Register from server
 */
export async function registerServer(data: RegisterRequest): Promise<RegisterResponse> {
  return serverFetch<RegisterResponse>('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email.trim(),
      password: data.password,
      fullName: data.fullName.trim(),
      role: data.role || 'Candidate',
    }),
  });
}

/**
 * Forgot password from server
 */
export async function forgotPasswordServer(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return serverFetch<ForgotPasswordResponse>('/api/Auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email.trim(),
    }),
  });
}

/**
 * Reset password from server
 */
export async function resetPasswordServer(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return serverFetch<ResetPasswordResponse>('/api/Auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email.trim(),
      token: data.token,
      newPassword: data.newPassword,
    }),
  });
}
