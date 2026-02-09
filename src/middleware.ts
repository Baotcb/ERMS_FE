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

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Generate nonce and CSRF token (these are lightweight operations)
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  const csrfToken = request.cookies.get('__Host-csrf-token')?.value || crypto.randomUUID()

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
    if (role === 'Candidate') {
      return NextResponse.redirect(new URL('/jobs', request.url))
    } else if (['HRManager', 'Director', 'HR'].includes(role || '')) {
      return NextResponse.redirect(new URL('/enterprise/hr/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/enterprise/dept-head/dashboard', request.url))
    }
  }

  // CSRF Validation on mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
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
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-csrf-token', csrfToken)

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
  response.cookies.set('__Host-csrf-token', csrfToken, {
    path: '/',
    secure: true, // Required for __Host- prefix
    sameSite: 'strict',
    httpOnly: false, // Allow client side to read it for x-csrf-token header
  })

  // Set CSP header with nonce (replace template placeholder)
  const cspHeader = CSP_TEMPLATE.replace('{nonce}', nonce)
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  response.headers.set('x-csrf-token', csrfToken)

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
