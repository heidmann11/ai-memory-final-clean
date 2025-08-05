// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('⛽ Supabase URL:', supabaseUrl)
console.log('⛽ Supabase ANON KEY:', supabaseAnonKey?.slice(0, 5) + '…') 

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return supabase
}

export { supabase }
export default supabase
