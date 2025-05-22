// Environment variables access
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ""

// Function to safely access environment variables
export function getEnvVariable(key: string, defaultValue = ""): string {
  const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || defaultValue
  return value
}

// Variables de entorno para la aplicación
export const APP_NAME = getEnvVariable("APP_NAME", "Biblioteca de Rituales - Le Droit Humano")
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

// Añade esta función para verificar el modo producción
export function isProductionMode(): boolean {
  return process.env.NEXT_PUBLIC_PRODUCTION_MODE === "true"
}
