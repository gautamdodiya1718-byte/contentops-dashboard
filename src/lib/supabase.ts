import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Use service_role key for full read/write (bypasses RLS)
// Safe for internal team tool with no public access
const key = supabaseServiceKey || supabaseAnonKey

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  key || 'placeholder'
)

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!key && supabaseUrl !== 'https://placeholder.supabase.co'
}
