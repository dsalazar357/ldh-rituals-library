// Validación de variables de entorno
function getEnvVariable(key: string, defaultValue?: string): string {
  // En el navegador, solo podemos acceder a las variables NEXT_PUBLIC_*
  if (typeof window !== "undefined") {
    const value = process.env[`NEXT_PUBLIC_${key}`]
    return value || defaultValue || ""
  }

  // En el servidor, podemos acceder a todas las variables
  const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`]
  return value || defaultValue || ""
}

// Variables de entorno para la aplicación
export const APP_NAME = getEnvVariable("APP_NAME", "Biblioteca de Rituales - Le Droit Humain")
export const APP_URL = getEnvVariable("APP_URL", "http://localhost:3000")

// Variables de entorno para autenticación
export const AUTH_SECRET = getEnvVariable("AUTH_SECRET", "clave_secreta_por_defecto")

// Credenciales de administrador por defecto
export const ADMIN_EMAIL = getEnvVariable("ADMIN_EMAIL", "admin@ldh.org")
export const ADMIN_PASSWORD = getEnvVariable("ADMIN_PASSWORD", "admin123")
export const ADMIN_NAME = getEnvVariable("ADMIN_NAME", "Administrador")

// Credenciales de usuario de prueba
export const TEST_USER_EMAIL = getEnvVariable("TEST_USER_EMAIL", "usuario@ldh.org")
export const TEST_USER_PASSWORD = getEnvVariable("TEST_USER_PASSWORD", "user123")
export const TEST_USER_NAME = getEnvVariable("TEST_USER_NAME", "Usuario de Prueba")
