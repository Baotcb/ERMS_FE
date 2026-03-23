import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { USER_ROLES, ROLE_DASHBOARD_MAP, DEFAULT_ENTERPRISE_DASHBOARD } from '@/utils/constants'
import { parseJwt } from '@/utils/jwt'

/**
 * Security Middleware
 * Handles security headers, route protection, and authentication checks.
 */

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/confirm-email',
  '/not-found',
  '/unauthorized',
] as const

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

const CANDIDATE_ONLY_ROUTE_PATTERNS = [
  '/applications',
  '/offers',
  '/jobs/saved',
  '/settings',
] as const

const CSRF_EXEMPT_ROUTE_PATTERNS = [
  '/api/auth/session',
  '/api/Auth/login',
  '/api/Auth/register',
  '/api/Auth/google-login',
  '/api/Auth/forgot-password',
  '/api/Auth/reset-password',
  '/api/Auth/confirm-email',
  '/api/Auth/resend-confirmation',
  '/api/Auth/register-enterprise',
  '/api/Auth/create-hr-account',
] as const

const CSP_TEMPLATE = `
  default-src 'self';
  connect-src 'self' https://api.cloudinary.com;
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https: http:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://github.com https://*.githubusercontent.com https://images.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com;
  font-src 'self' data:;
  frame-src https://www.youtube.com https://youtube.com https://drive.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

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

const CSRF_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-csrf-token' : 'csrf-token'

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/'
    }

    return pathname.startsWith(route)
  })
}

function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

function isCandidateOnlyRoute(pathname: string): boolean {
  return CANDIDATE_ONLY_ROUTE_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

function isCsrfExemptRoute(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTE_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwt(token)

    if (!payload?.exp || typeof payload.exp !== 'number') {
      return true
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime - 10
  } catch {
    return true
  }
}

function getTokenRole(token?: string): string | undefined {
  if (!token) {
    return undefined
  }

  try {
    const payload = parseJwt(token)
    return String(
      payload?.role ||
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      ''
    ) || undefined
  } catch {
    return undefined
  }
}

function buildLoginRedirect(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL('/login', request.url)
  const redirectTarget = `${pathname}${request.nextUrl.search}`
  loginUrl.searchParams.set('redirect', redirectTarget)
  return NextResponse.redirect(loginUrl)
}

function applySecurityHeaders(
  response: NextResponse,
  options: { csrfToken?: string; nonce?: string; needsNonce: boolean }
) {
  const { csrfToken, nonce, needsNonce } = options

  if (csrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false,
    })
    response.headers.set('x-csrf-token', csrfToken)
  }

  if (needsNonce && nonce) {
    response.headers.set('Content-Security-Policy', CSP_TEMPLATE.replace('{nonce}', nonce))
    response.headers.set('x-nonce', nonce)
  }

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  const isPublic = isPublicRoute(pathname)
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
  const needsNonce = Boolean(!pathname.startsWith('/api/') &&
    !pathname.match(/\.(json|xml|txt)$/) &&
    request.headers.get('accept')?.includes('text/html'))

  const nonce = needsNonce ? Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64') : ''
  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value || crypto.randomUUID()
  const authCookie = request.cookies.get('auth_token')?.value
  const isExpired = authCookie ? isTokenExpired(authCookie) : true
  const role = request.cookies.get('user_role')?.value || getTokenRole(authCookie)

  if (pathname === '/' && !isMutation && authCookie && !isExpired && role && role !== USER_ROLES.CANDIDATE) {
    const dashboard = ROLE_DASHBOARD_MAP[role] || DEFAULT_ENTERPRISE_DASHBOARD
    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  if (requiresAuth(pathname) && (!authCookie || isExpired)) {
    return buildLoginRedirect(request, pathname)
  }

  if (isCandidateOnlyRoute(pathname)) {
    if (!authCookie || isExpired) {
      return buildLoginRedirect(request, pathname)
    }

    if (role && role !== USER_ROLES.CANDIDATE) {
      const dashboard = ROLE_DASHBOARD_MAP[role] || DEFAULT_ENTERPRISE_DASHBOARD
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  if (pathname.startsWith('/enterprise') && authCookie && !isExpired && role === USER_ROLES.CANDIDATE) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if ((isPublic || pathname === '/enterprise' || pathname === '/enterprise/') && authCookie && !isExpired) {
    if (role === USER_ROLES.CANDIDATE) {
      if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else if (role) {
      const dashboard = ROLE_DASHBOARD_MAP[role] || DEFAULT_ENTERPRISE_DASHBOARD
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  if (isMutation && !request.headers.has('next-action') && !isCsrfExemptRoute(pathname)) {
    const headerToken = request.headers.get('x-csrf-token')

    if (headerToken !== csrfToken) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }
  }

  const requestHeaders = new Headers(request.headers)

  if (needsNonce && nonce) {
    requestHeaders.set('x-nonce', nonce)
  }

  if (csrfToken) {
    requestHeaders.set('x-csrf-token', csrfToken)
  }

  if (pathname.startsWith('/api/') && authCookie) {
    requestHeaders.set('Authorization', `Bearer ${authCookie}`)
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  applySecurityHeaders(response, { csrfToken, nonce, needsNonce })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
