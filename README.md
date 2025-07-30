# Biblioteca de Rituales - Le Droit Humain

Biblioteca digital de rituales masónicos de Le Droit Humain.

## Configuración

### Requisitos previos

- Node.js 18 o superior
- Cuenta en Supabase
- Cuenta en Vercel

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

\`\`\`
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
\`\`\`

### Configuración de Supabase

1. Crea un nuevo proyecto en Supabase
2. Ve a SQL Editor y ejecuta el script en `supabase/schema.sql`
3. Configura la autenticación de correo electrónico en Authentication > Providers
4. Copia las credenciales de API desde Settings > API

### Creación del usuario administrador

Ejecuta el siguiente comando para crear un usuario administrador:

\`\`\`bash
npx ts-node scripts/seed-admin.ts
\`\`\`

Esto creará un usuario administrador con las siguientes credenciales:
- Email: admin@ldh.org
- Contraseña: admin123

**Nota**: Cambia estas credenciales en producción.

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
\`\`\`

## Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega el proyecto

## Características

- Autenticación de usuarios con Supabase Auth
- Almacenamiento de archivos con Vercel Blob
- Base de datos PostgreSQL con Supabase
- Control de acceso basado en roles y grados
- Interfaz de usuario moderna con Tailwind CSS y shadcn/ui
