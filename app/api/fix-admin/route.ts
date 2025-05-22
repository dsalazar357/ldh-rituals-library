import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar si existe el usuario admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@ldh.org")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Error al verificar usuario admin", details: checkError.message },
        { status: 500 },
      )
    }

    if (existingAdmin) {
      // Actualizar el rol a admin si existe
      const { error: updateError } = await supabase.from("users").update({ role: "admin" }).eq("email", "admin@ldh.org")

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
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: "admin",
        },
      })
    } else {
      // Crear usuario admin si no existe
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: "admin@ldh.org",
        password: "admin123",
        email_confirm: true,
      })

      if (authError) {
        return NextResponse.json(
          { error: "Error al crear usuario admin en Auth", details: authError.message },
          { status: 500 },
        )
      }

      // Crear registro en la tabla users
      const { data: newUser, error: userError } = await supabase.from("users").insert([
        {
          id: authUser.user.id,
          name: "Administrador",
          email: "admin@ldh.org",
          degree: "33",
          role: "admin",
        },
      ])

      if (userError) {
        return NextResponse.json(
          { error: "Error al crear usuario admin en tabla users", details: userError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Usuario admin creado correctamente",
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          role: "admin",
        },
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
