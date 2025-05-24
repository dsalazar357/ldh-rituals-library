// stores/authAtoms.ts
import { atom } from "jotai"
import type { User } from "@/types/user"
import type { Session } from "@supabase/supabase-js"

// Atoms to store auth state
export const userAtom = atom<User | null>(null)
export const sessionAtom = atom<Session | null>(null)
export const isLoadingAtom = atom<boolean>(true)
