import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Get the token using the same secret used in your NextAuth configuration
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If it's the booking path and user is not authenticated, redirect to login
  if (path.startsWith('/booking')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
    // If user is authenticated, allow access to booking page
    return NextResponse.next()
  }

  // Allow all other requests
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/booking/:path*']
} 