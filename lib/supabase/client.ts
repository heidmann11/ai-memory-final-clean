import { createBrowserClient } from '@supabase/ssr'

// Define a type for your database schema to get type safety
// You can generate this automatically with the Supabase CLI
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: { // The data coming from the database
          id: string
          customer_name: string | null
          address: string | null
          lat: number | null
          lng: number | null
          service: string | null
          priority: string | null
          status: string | null
          estimated_duration: number | null
          title: string | null
          description: string | null
          scheduled_start: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          estimated_cost: number | null
          created_at: string
          // Add any other columns here
        }
        Insert: { // The data you can insert
          // ... define insert types if needed
        }
        Update: { // The data you can update
          // ... define update types if needed
        }
      }
    }
    Views: {
      // ... your views
    }
    Functions: {
      // ... your functions
    }
  }
}


export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}