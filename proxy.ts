import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isValidSession = request.cookies.get('admin_session')?.value === 'authenticated'

  // If hitting the /admin/login page
  if (pathname === '/admin/login') {
    if (isValidSession) {
      // Already authenticated, redirect to dash
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // If hitting any other /admin route and NOT authenticated
  if (pathname.startsWith('/admin')) {
    if (!isValidSession) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
