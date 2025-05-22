/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowDevelopmentBuild: false,
  },
  // Deshabilitar el prerendering estático para las páginas del dashboard
  output: 'standalone',
  // Configurar rutas específicas para ser generadas bajo demanda
  unstable_excludeDefaultMomentLocales: true,
}

export default nextConfig
