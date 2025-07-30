import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create and export the client directly
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Alternative export function (for backward compatibility)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export default supabase