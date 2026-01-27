import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security Middleware
 * Handles security headers, route protection, and authentication checks
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/not-found',
] as const

// Route patterns that require authentication
const PROTECTED_ROUTE_PATTERNS = [
  '/dashboard',
  '/departments',
  '/employees',
  '/profile',
  '/security',
  '/candidate',
] as const

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

/**
 * Check if a route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some(pattern =>
    pathname.startsWith(pattern)
  )
}

/**
 * Generate security headers
 */
function getSecurityHeaders(): HeadersInit {
  return {
    // Content Security Policy - Mitigate XSS and clickjacking attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://github.com https://*.githubusercontent.com https://images.unsplash.com https://res.cloudinary.com",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:* https://*.azurewebsites.net https://*.google-analytics.com https://api.cloudinary.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),

    // HTTP Strict Transport Security - Force HTTPS in production
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Content-Type-Options - Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // X-Frame-Options - Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // X-XSS-Protection - Enable XSS filtering
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy - Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy - Control browser features
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

    // Cross-Origin-Opener-Policy - Control cross-origin windows
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Cross-Origin-Resource-Policy - Control resource access
    'Cross-Origin-Resource-Policy': 'same-origin',
  }
}

/**
 * Check if a JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = atob(base64)
    const payload = JSON.parse(jsonPayload)

    if (!payload.exp) return false

    // Add 10s leeway for clock skew
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime - 10
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value
  const isExpired = token ? isTokenExpired(token) : true

  // Route protection
  if (requiresAuth(pathname) && (!token || isExpired)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)

    const response = NextResponse.redirect(loginUrl)

    // Clear cookies if token is expired
    if (token && isExpired) {
      response.cookies.delete('auth_token')
      response.cookies.delete('user_role')
    }

    return response
  }

  // Prevent authenticated users from accessing auth pages
  if (isPublicRoute(pathname) && token && !isExpired) {
    // If logged in and NOT expired, redirect based on role
    const role = request.cookies.get('user_role')?.value

    if (role === 'Candidate') {
      return NextResponse.redirect(new URL('/jobs', request.url))
    } else {
      // HR Manager / Admin / Employee -> Enterprise Dashboard
      return NextResponse.redirect(new URL('/enterprise/dashboard', request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
