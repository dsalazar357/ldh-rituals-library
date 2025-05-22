// Environment variables access
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ""

// Function to safely access environment variables
export function getEnvVariable(key: string, defaultValue = ""): string {
  const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`] || defaultValue
  return value
}

// Variables de entorno para la aplicación
export const APP_NAME = getEnvVariable("APP_NAME", "Biblioteca de Rituales - Le Droit Humain")
export const APP_URL = getEnvVariable("APP_URL", "http://localhost:3000")

// Variables de entorno para autenticación
export const AUTH_SECRET = getEnvVariable("AUTH_SECRET", "clave_secreta_por_defecto")

// Siempre devuelve true para forzar el modo producción
export function isProductionMode(): boolean {
  return true
}
