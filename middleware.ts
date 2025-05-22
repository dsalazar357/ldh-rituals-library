import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if we're in a preview environment
  const isPreviewEnvironment =
    req.headers.get("host")?.includes("localhost") || req.headers.get("host")?.includes("vercel.app")

  // Check for our custom auth cookies
  const accessToken = req.cookies.get("sb-access-token")?.value
  const userRole = req.cookies.get("user-role")?.value
  const userEmail = req.cookies.get("user-email")?.value

  // Consider the user authenticated if we have either a Supabase token or our custom role cookie
  const isAuthenticated = !!accessToken || !!userRole

  // If there's no session and the user is trying to access a protected route
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/registro")

  // In preview environment, allow all routes
  if (isPreviewEnvironment) {
    return res
  }

  if (!isAuthenticated && !isAuthRoute) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access an auth route
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/login|api/seed-admin).*)"],
}
