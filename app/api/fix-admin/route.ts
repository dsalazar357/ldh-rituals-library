import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export async function GET() {
  try {
    // Crear un cliente de Supabase admin directamente sin usar cookies
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Verificar si existe el usuario admin
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", "admin@ldh.org")
      .single()

    if (checkError && !checkError.message.includes("No rows found")) {
      return NextResponse.json(
        { error: "Error al verificar usuario admin", details: checkError.message },
        { status: 500 },
      )
    }

    if (existingAdmin) {
      // Actualizar el rol a admin si existe
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
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: "admin",
        },
      })
    } else {
      // Crear usuario admin si no existe
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
      const { data: newUser, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authUser.user.id,
          name: "Administrador",
          email: "admin@ldh.org",
          degree: 33,
          lodge: "Admin",
          role: "admin",
        })
        .select()

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
    console.error("Error en fix-admin:", error)
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
