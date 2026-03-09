import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { USER_ROLES, ROLE_DASHBOARD_MAP } from '@/utils/constants'
import { parseJwt } from '@/utils/jwt'

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
  '/verify-email',
  '/confirm-email',
  '/not-found',
  '/unauthorized'
] as const

// Route patterns that require authentication
const PROTECTED_ROUTE_PATTERNS = [
  '/dashboard',
  '/departments',
  '/employees',
  '/profile',
  '/security',
  '/candidate',
  '/enterprise',
  '/hr',
] as const

// Constant CSP header template (nonce will be injected dynamically)
const CSP_TEMPLATE = `
  default-src 'self';
  connect-src 'self' https://api.cloudinary.com;
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https: http:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://github.com https://*.githubusercontent.com https://images.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

// Constant security headers (set once, not per request)
const SECURITY_HEADERS: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// CSRF cookie name: __Host- prefix requires HTTPS, use plain name in development
const CSRF_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-csrf-token' : 'csrf-token'

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
 * Check if a JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwt(token)

    if (!payload?.exp || typeof payload.exp !== 'number') {
      return true
    }

    // Add 10s leeway for clock skew
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime - 10
  } catch {
    return true
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // For public routes, skip heavy auth processing and only add security headers
  const isPublic = isPublicRoute(pathname)
  const method = request.method
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  // Only generate nonce for HTML pages (skip for API, assets, etc.)
  const needsNonce = !pathname.startsWith('/api/') &&
    !pathname.match(/\.(json|xml|txt)$/) &&
    request.headers.get('accept')?.includes('text/html')

  // Redirect authenticated non-candidate users away from '/'
  // Home page is only for guests and Candidates
  if (pathname === '/' && !isMutation) {
    const token = request.cookies.get('auth_token')?.value
    if (token && !isTokenExpired(token)) {
      const role = request.cookies.get('user_role')?.value
      if (role && role !== USER_ROLES.CANDIDATE) {
        const dashboard = ROLE_DASHBOARD_MAP[role] || '/enterprise/hr/dashboard'
        return NextResponse.redirect(new URL(dashboard, request.url))
      }
    }
  }

  // Generate minimal headers for public routes
  if (isPublic && !isMutation && pathname !== '/enterprise') {
    if (needsNonce) {
      const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
      const cspHeader = CSP_TEMPLATE.replace('{nonce}', nonce)

      const response = NextResponse.next()
      response.headers.set('Content-Security-Policy', cspHeader)
      response.headers.set('x-nonce', nonce)
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    const response = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // Generate nonce and CSRF token (only when needed)
  const nonce = needsNonce ? Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64') : ''
  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value || crypto.randomUUID()

  // Auth Logic (Route Protection) - Check early to avoid unnecessary processing
  const authCookie = request.cookies.get('auth_token')?.value
  const isExpired = authCookie ? isTokenExpired(authCookie) : true

  // Redirect logic - return early on redirects
  if (requiresAuth(pathname) && (!authCookie || isExpired)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((isPublicRoute(pathname) || pathname === '/enterprise' || pathname === '/enterprise/') && authCookie && !isExpired) {
    const role = request.cookies.get('user_role')?.value
    if (role === USER_ROLES.CANDIDATE) {
      // Candidates stay on '/' — only redirect from other public routes (e.g. /login)
      if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else if (role) {
      const dashboard = ROLE_DASHBOARD_MAP[role] || '/enterprise/hr/dashboard'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  // CSRF Validation on mutations
  if (isMutation) {
    // Skip CSRF check for Server Actions
    if (!request.headers.has('next-action')) {
      const headerToken = request.headers.get('x-csrf-token')
      if (headerToken !== csrfToken && !pathname.startsWith('/api/auth/session')) {
        // Block request if CSRF tokens don't match
        return new NextResponse('Invalid CSRF token', { status: 403 })
      }
    }
  }

  // Prepare request headers (only if needed for API routes)
  const requestHeaders = new Headers(request.headers)

  if (needsNonce) {
    requestHeaders.set('x-nonce', nonce)
  }

  if (csrfToken) {
    requestHeaders.set('x-csrf-token', csrfToken)
  }

  if (pathname.startsWith('/api/') && authCookie) {
    requestHeaders.set('Authorization', `Bearer ${authCookie}`)
  }

  // Create final response with request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })

  // Set CSRF cookie
  // Set CSRF cookie with __Host- prefix for better security
  if (csrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false, // Allow client side to read it for x-csrf-token header
    })
  }

  // Set CSP header with nonce (replace template placeholder) - only for HTML pages
  if (needsNonce && nonce) {
    const cspHeader = CSP_TEMPLATE.replace('{nonce}', nonce)
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
  }

  if (csrfToken) {
    response.headers.set('x-csrf-token', csrfToken)
  }

  // Set all security headers in one loop
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
