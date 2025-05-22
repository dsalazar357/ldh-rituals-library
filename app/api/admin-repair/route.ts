import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Crear un cliente de Supabase admin directamente
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Buscar el usuario admin por email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ error: "Error al listar usuarios", details: authError.message }, { status: 500 })
    }

    // Buscar el usuario admin por email
    const adminUser = authUser.users.find((user) => user.email === "admin@ldh.org")

    if (adminUser) {
      // El usuario existe, actualizar su rol en la tabla users
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ role: "admin" })
        .eq("email", "admin@ldh.org")

      if (updateError) {
        return NextResponse.json(
          { error: "Error al actualizar rol de admin", details: updateError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Usuario admin actualizado correctamente",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: "admin",
        },
      })
    } else {
      // Crear el usuario admin
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@ldh.org",
        password: "admin123",
        email_confirm: true,
      })

      if (createError) {
        return NextResponse.json(
          { error: "Error al crear usuario admin", details: createError.message },
          { status: 500 },
        )
      }

      // Insertar en la tabla users
      const { error: insertError } = await supabaseAdmin.from("users").insert({
        id: newAuthUser.user.id,
        name: "Administrador",
        email: "admin@ldh.org",
        degree: 33,
        role: "admin",
      })

      if (insertError) {
        return NextResponse.json(
          { error: "Error al insertar usuario en tabla users", details: insertError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Usuario admin creado correctamente",
        user: {
          id: newAuthUser.user.id,
          email: newAuthUser.user.email,
          role: "admin",
        },
      })
    }
  } catch (error: any) {
    console.error("Error en admin-repair:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
