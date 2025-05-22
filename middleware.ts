import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

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

  try {
    // Verificar sesión
    const { data } = await supabase.auth.getSession()
    const session = data?.session

    // Rutas públicas
    const publicRoutes = ["/login", "/registro"]
    const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname === route)

    // Rutas de API
    const apiRoutes = ["/api/login", "/api/logout", "/api/seed-admin"]
    const isApiRoute = apiRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Permitir acceso a rutas de API
    if (isApiRoute) {
      return res
    }

    // Redirigir a login si no hay sesión y la ruta no es pública
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redirigir al dashboard si hay sesión y la ruta es pública
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Verificar acceso a rutas de administrador
    if (session && req.nextUrl.pathname.startsWith("/admin")) {
      try {
        const { data: userData, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (error || !userData || userData.role !== "admin") {
          return NextResponse.redirect(new URL("/", req.url))
        }
      } catch (error) {
        console.error("Error al verificar rol de administrador:", error)
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return res
  } catch (error) {
    console.error("Error en middleware:", error)

    // En caso de error, permitir acceso a rutas públicas y API
    const publicRoutes = ["/login", "/registro"]
    const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname === route)
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/")

    if (isPublicRoute || isApiRoute) {
      return res
    }

    // Redirigir a login para otras rutas
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
