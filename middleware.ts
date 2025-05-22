import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Crear cliente de Supabase para el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          })
        },
      },
    },
  )

  // Verificar sesión
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/registro"]
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname === route)

  // Rutas de API que no requieren verificación
  const apiRoutes = ["/api/login", "/api/logout", "/api/seed-admin"]
  const isApiRoute = apiRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Permitir acceso a rutas de API sin verificación
  if (isApiRoute) {
    return res
  }

  // Redirigir a login si no hay sesión y la ruta no es pública
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirigir al dashboard si hay sesión y la ruta es pública
  if (session && isPublicRoute) {
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Verificar acceso a rutas de administrador
  if (session && req.nextUrl.pathname.startsWith("/admin")) {
    // Obtener rol del usuario
    const { data: userData, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (error || !userData || userData.role !== "admin") {
      // No es administrador, redirigir al dashboard
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
