import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/registro"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Rutas de API que no requieren verificación
  const apiRoutes = ["/api/login", "/api/logout", "/api/seed-admin"]
  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route))

  // Permitir acceso a rutas de API y recursos estáticos sin verificación
  if (isApiRoute || pathname.startsWith("/_next/") || pathname.includes(".")) {
    return res
  }

  try {
    console.log(`Middleware: Verificando ruta ${pathname}`)

    // Crear cliente de Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = req.cookies.get(name)?.value
            console.log(`Middleware: Cookie ${name} = ${cookie ? "presente" : "ausente"}`)
            return cookie
          },
          set(name: string, value: string, options: any) {
            console.log(`Middleware: Estableciendo cookie ${name}`)
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            console.log(`Middleware: Eliminando cookie ${name}`)
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
    console.log(`Middleware: Sesión ${session ? "encontrada" : "no encontrada"}`)

    // Si no hay sesión y la ruta no es pública, redirigir a login
    if (!session && !isPublicRoute) {
      console.log(`Middleware: Redirigiendo a login desde ${pathname}`)
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Si hay sesión y la ruta es pública, redirigir al dashboard
    if (session && isPublicRoute) {
      console.log(`Middleware: Redirigiendo a dashboard desde ${pathname}`)
      const redirectUrl = new URL("/", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Error en middleware:", error)

    // En caso de error, permitir acceso a rutas públicas
    if (isPublicRoute) {
      return res
    }

    // Redirigir a login para otras rutas
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
