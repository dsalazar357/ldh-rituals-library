export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          degree: number
          lodge: string
          role: "admin" | "user"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          degree: number
          lodge: string
          role?: "admin" | "user"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          degree?: number
          lodge?: string
          role?: "admin" | "user"
          created_at?: string
          updated_at?: string
        }
      }
      rituals: {
        Row: {
          id: string
          name: string
          degree: number
          ritual_system: string
          language: string
          author: string
          file_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          degree: number
          ritual_system: string
          language: string
          author: string
          file_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          degree?: number
          ritual_system?: string
          language?: string
          author?: string
          file_url?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
