import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// This script should be run from the command line to create an admin user
// Usage: npx ts-node scripts/seed-admin.ts

async function seedAdmin() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  // Create Supabase admin client
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  try {
    // Create admin user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@ldh.org",
      password: "admin123",
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating admin user in auth:", authError)
      process.exit(1)
    }

    console.log("Admin user created in auth:", authUser.user.id)

    // Create admin user profile
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .upsert({
        id: authUser.user.id,
        name: "Administrador",
        degree: 33,
        lodge: "Admin",
        role: "admin",
      })
      .select()

    if (profileError) {
      console.error("Error creating admin user profile:", profileError)
      process.exit(1)
    }

    console.log("Admin user profile created:", profileData)
    console.log("Admin user created successfully!")
  } catch (error) {
    console.error("Unexpected error:", error)
    process.exit(1)
  }
}

seedAdmin()
