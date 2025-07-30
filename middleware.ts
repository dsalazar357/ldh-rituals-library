import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Función para verificar si una URL está en la lista de excepciones
function isExcludedPath(pathname: string): boolean {
  // Rutas que no requieren verificación
  return (
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/auth-debug" ||
    pathname === "/debug" ||
    pathname === "/user-debug" ||
    pathname === "/admin-debug" ||
    pathname === "/admin-check" ||
    pathname.startsWith("/auth-debug/") ||
    pathname.startsWith("/user-debug/") ||
    pathname.startsWith("/admin-debug/") ||
    pathname.startsWith("/admin-check/")
  )
}

export async function middleware(req: NextRequest) {
  // Evitar procesar rutas estáticas y API
  if (isExcludedPath(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/registro"]
  const isPublicRoute = publicRoutes.includes(pathname)

  try {
    // Crear cliente de Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
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
    const { data } = await supabase.auth.getSession()
    const session = data?.session

    console.log(`Middleware: Ruta=${pathname}, Sesión=${session ? "Activa" : "Inactiva"}, Pública=${isPublicRoute}`)

    // Si no hay sesión y la ruta no es pública, redirigir a login
    if (!session && !isPublicRoute) {
      console.log(`Middleware: Redirigiendo a login desde ${pathname} (no hay sesión)`)
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // NO redirigir automáticamente desde rutas públicas si hay sesión
    // Dejar que el usuario navegue manualmente

    return res
  } catch (error) {
    console.error("Error en middleware:", error)

    // En caso de error, permitir acceso a rutas públicas
    if (isPublicRoute) {
      return res
    }

    // Redirigir a login para otras rutas
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
