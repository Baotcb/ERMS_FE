import type React from "react"

export type UserRole = "guest" | "employee" | "hr" | "candidate"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  fullName?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

// Auth related types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  confirmPassword?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResponse {
  token?: string
  user?: User
  message?: string
  success?: boolean
  userId?: string
}

// API-specific types (matching backend responses)
export interface ApiUser {
  id: string
  email: string
  fullName: string
  role: string
}

export interface ApiAuthResponse {
  token?: string
  user?: ApiUser
  message?: string
  success?: boolean
  userId?: string
}

// Profile related types
export interface UserProfile {
  userName: string
  email: string
  fullName: string
  dateOfBirth?: string
  hometown?: string
  phones?: string
  departmentId?: string
  departmentName?: string
  status: number
  dateJoined: string
}

export interface UpdateProfileData {
  fullName: string
  dateOfBirth?: string
  hometown?: string
  phones?: string
}
