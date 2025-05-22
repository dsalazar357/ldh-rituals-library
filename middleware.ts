import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Inicializar el cliente de Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path: string; domain?: string }) {
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

  // Verificar si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Considerar al usuario autenticado si hay una sesión
  const isAuthenticated = !!session

  // Definir rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/registro"]
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname === route)

  // Definir rutas de API que no deben ser bloqueadas
  const apiRoutes = ["/api/login", "/api/logout", "/api/seed-admin"]
  const isApiRoute = apiRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Si es una ruta de API, permitir el acceso sin verificar autenticación
  if (isApiRoute) {
    return res
  }

  // Si no hay sesión y el usuario está tratando de acceder a una ruta protegida
  if (!isAuthenticated && !isPublicRoute) {
    console.log(`Redirigiendo a login desde ${req.nextUrl.pathname} - No autenticado`)
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay una sesión y el usuario está tratando de acceder a una ruta de autenticación
  if (isAuthenticated && isPublicRoute) {
    console.log(`Redirigiendo a dashboard desde ${req.nextUrl.pathname} - Ya autenticado`)
    const redirectUrl = new URL("/", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
