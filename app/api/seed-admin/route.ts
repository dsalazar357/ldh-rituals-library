import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// SQL to create the necessary tables
const createTablesSql = `
-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  degree INTEGER NOT NULL DEFAULT 1,
  lodge TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create rituals table
CREATE TABLE IF NOT EXISTS public.rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  degree INTEGER NOT NULL,
  ritual_system TEXT NOT NULL,
  language TEXT NOT NULL,
  author TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rituals_updated_at ON public.rituals;
CREATE TRIGGER update_rituals_updated_at
  BEFORE UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

export async function GET() {
  try {
    // Inicializar el cliente de Supabase con las opciones de cookies correctas
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: { path: string; domain?: string }) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          },
        },
      },
    )

    // Step 1: Create tables if they don't exist
    console.log("Creating tables if they don't exist...")
    const { error: tablesError } = await supabase.sql(createTablesSql)

    if (tablesError) {
      console.error("Error creating tables:", tablesError)
      return NextResponse.json({ error: `Error creating tables: ${tablesError.message}` }, { status: 500 })
    }

    // Step 2: Check if admin already exists in Auth
    console.log("Checking if admin already exists in Auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error listing users:", authError)
      return NextResponse.json({ error: `Error listing users: ${authError.message}` }, { status: 500 })
    }

    const adminAuthUser = authData.users.find((user) => user.email === "admin@ldh.org")

    // Step 3: Delete existing admin user if it exists (to ensure clean state)
    if (adminAuthUser) {
      console.log("Deleting existing admin user from Auth...")
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(adminAuthUser.id)

      if (deleteAuthError) {
        console.error("Error deleting admin user from Auth:", deleteAuthError)
        return NextResponse.json(
          { error: `Error deleting admin user from Auth: ${deleteAuthError.message}` },
          { status: 500 },
        )
      }

      // Also delete from users table
      console.log("Deleting existing admin user from database...")
      const { error: deleteDbError } = await supabase.from("users").delete().eq("email", "admin@ldh.org")

      if (deleteDbError) {
        console.error("Error deleting admin user from database:", deleteDbError)
        // Continue anyway, as the user might not exist in the database
      }
    }

    // Step 4: Create admin user in Auth
    console.log("Creating admin user in Auth...")
    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: "admin@ldh.org",
      password: "admin123",
      email_confirm: true,
    })

    if (createAuthError) {
      console.error("Error creating admin user in Auth:", createAuthError)
      return NextResponse.json(
        { error: `Error creating admin user in Auth: ${createAuthError.message}` },
        { status: 500 },
      )
    }

    if (!newAuthUser.user) {
      return NextResponse.json({ error: "Failed to create admin user in Auth" }, { status: 500 })
    }

    // Step 5: Create admin user profile in database
    console.log("Creating admin user profile in database...")
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: newAuthUser.user.id,
        name: "Administrador",
        email: "admin@ldh.org",
        degree: 33,
        lodge: "Admin",
        role: "admin",
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating admin user profile:", userError)
      return NextResponse.json({ error: `Error creating admin user profile: ${userError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: userData,
      authUser: newAuthUser.user,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error?.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
