import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: ritual, error } = await supabase.from("rituals").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching ritual:", error)
      return NextResponse.json({ error: "Ritual no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ ritual })
  } catch (error) {
    console.error("Error in ritual API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { error } = await supabase.from("rituals").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting ritual:", error)
      return NextResponse.json({ error: "Error al eliminar ritual" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete ritual API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
