# Biblioteca de Rituales - Le Droit Humain

Biblioteca digital de rituales masónicos de Le Droit Humain.

## Configuración de Variables de Entorno

Para ejecutar este proyecto, puedes configurar las siguientes variables de entorno:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido de `.env.example` a `.env.local`
3. Completa los valores con tus propias credenciales

\`\`\`bash
# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME="Biblioteca de Rituales - Le Droit Humain"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Autenticación (para una implementación real)
AUTH_SECRET="tu_clave_secreta_para_autenticacion"

# Credenciales de administrador por defecto
ADMIN_EMAIL="admin@ldh.org"
ADMIN_PASSWORD="contraseña_segura_aqui"
ADMIN_NAME="Administrador"

# Credenciales de usuario de prueba
TEST_USER_EMAIL="usuario@ldh.org"
TEST_USER_PASSWORD="contraseña_usuario_aqui"
TEST_USER_NAME="Usuario de Prueba"
\`\`\`

### Notas importantes:

- Las variables que comienzan con `NEXT_PUBLIC_` estarán disponibles en el navegador
- Las demás variables solo estarán disponibles en el servidor
- Si no configuras estas variables, se usarán valores por defecto

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
\`\`\`

## Despliegue

El proyecto está configurado para desplegarse en Vercel. Asegúrate de configurar las variables de entorno en el panel de control de Vercel.

\`\`\`bash
# Desplegar en Vercel
vercel
\`\`\`

## Seguridad

En una implementación de producción, deberías:

1. Nunca exponer credenciales en el código fuente
2. Usar un sistema de autenticación seguro (como NextAuth.js o Supabase Auth)
3. Almacenar datos en una base de datos segura (como PostgreSQL)
4. Almacenar archivos en un servicio de almacenamiento seguro (como Vercel Blob)
5. Rotar periódicamente las claves de acceso
\`\`\`

Finalmente, vamos a actualizar el componente de login para usar las variables de entorno:

```typescriptreact file="app/(auth)/login/page.tsx"
[v0-no-op-code-block-prefix]"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Importar las variables de entorno
import { ADMIN_EMAIL, ADMIN_PASSWORD, TEST_USER_EMAIL, TEST_USER_PASSWORD } from "@/lib/env"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  // Marcar como montado para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return

    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email, password)

      // Actualizar la lista de usuarios válidos en la función handleSubmit
      const validUsers = [
        {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          name: "Administrador",
          degree: 33,
          role: "admin",
        },
        {
          email: "logia.lucerodelalba@gmail.com",
          password: "MorningStar357***",
          name: "Lucero del Alba",
          degree: 33,
          role: "admin",
        },
        {
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          name: "Usuario Grado 1",
          degree: 1,
          role: "user",
        },
      ]

      // Buscar usuario que coincida
      const user = validUsers.find((u) => u.email === email && u.password === password)

      if (user) {
        console.log("Usuario encontrado:", user.name)

        // Guardar usuario en localStorage
        const { password, ...userInfo } = user
        try {
          localStorage.setItem("user", JSON.stringify(userInfo))
        } catch (error) {
          console.error("Error al guardar usuario:", error)
        }

        // Redirigir al dashboard
        router.push("/")
      } else {
        console.log("Credenciales incorrectas")
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Ocurrió un error. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a la biblioteca de rituales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/registro" className="text-primary hover:underline">
            Solicitar acceso
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
