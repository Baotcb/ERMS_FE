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
      "img-src 'self' data: https://*.githubusercontent.com https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.azurewebsites.net https://*.google-analytics.com",
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

  // Get auth token from cookies (httpOnly is preferred, but we also check localStorage via client)
  const token = request.cookies.get('auth_token')?.value

  // Route protection
  if (requiresAuth(pathname) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Prevent authenticated users from accessing auth pages
  if (isPublicRoute(pathname) && token) {
    // If logged in, redirect to dashboard or candidate jobs
    const isCandidate = pathname.includes('candidate') || pathname.includes('jobs')
    if (isCandidate) {
      return NextResponse.redirect(new URL('/candidate/jobs', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
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
