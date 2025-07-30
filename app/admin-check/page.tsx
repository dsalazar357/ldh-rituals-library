import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export default async function AdminCheckPage() {
  const adminInfo = { exists: false, role: null, authExists: false }
  let error = null

  try {
    // Crear un cliente de Supabase admin directamente
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verificar si el usuario existe en auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      throw new Error(`Error al listar usuarios de auth: ${authError.message}`)
    }

    const adminAuthUser = authUsers.users.find((user) => user.email === "admin@ldh.org")
    adminInfo.authExists = !!adminAuthUser

    if (adminAuthUser) {
      // Verificar si existe en la tabla users
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", "admin@ldh.org")
        .single()

      if (userError && !userError.message.includes("No rows found")) {
        throw new Error(`Error al verificar usuario en tabla users: ${userError.message}`)
      }

      if (userData) {
        adminInfo.exists = true
        adminInfo.role = userData.role
      }
    }
  } catch (e: any) {
    error = e.message
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Verificación de Usuario Admin</h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Estado del usuario admin</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Existe en Auth:</strong>{" "}
              {adminInfo.authExists ? (
                <span className="text-green-600">Sí</span>
              ) : (
                <span className="text-red-600">No</span>
              )}
            </li>
            <li>
              <strong>Existe en tabla Users:</strong>{" "}
              {adminInfo.exists ? <span className="text-green-600">Sí</span> : <span className="text-red-600">No</span>}
            </li>
            <li>
              <strong>Rol:</strong>{" "}
              {adminInfo.role ? (
                <span className="text-green-600">{adminInfo.role}</span>
              ) : (
                <span className="text-gray-500">No definido</span>
              )}
            </li>
          </ul>
        </div>
      )}

      <div className="flex space-x-4 mt-6">
        <a href="/api/admin-repair" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Reparar Usuario Admin
        </a>
        <a href="/login" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Ir a Login
        </a>
      </div>
    </div>
  )
}
