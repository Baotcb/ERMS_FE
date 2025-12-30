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

export interface AuthResponse {
  token?: string
  user?: User
  message?: string
  success?: boolean
}

export interface UserProfile {
  userName: string
  email: string
  fullName: string
  dateOfBirth?: string
  hometown?: string
  phones?: string
  departmentId?: number
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
