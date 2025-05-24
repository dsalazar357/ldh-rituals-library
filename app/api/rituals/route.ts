import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: rituals, error } = await supabase
      .from("rituals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching rituals:", error)
      return NextResponse.json({ error: "Error al obtener rituales" }, { status: 500 })
    }

    // Mapear los datos al formato esperado por el frontend
    const mappedRituals = (rituals || []).map((ritual) => ({
      id: ritual.id,
      name: ritual.name,
      degree: ritual.degree,
      ritualSystem: ritual.ritual_system,
      language: ritual.language,
      author: ritual.author,
      fileUrl: ritual.file_url,
      createdAt: ritual.created_at,
    }))

    console.log("Rituales encontrados:", mappedRituals.length)
    return NextResponse.json({ rituals: mappedRituals })
  } catch (error) {
    console.error("Error in rituals API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
