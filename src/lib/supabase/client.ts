import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidSupabaseUrl = typeof supabaseUrl === 'string'
  && supabaseUrl.startsWith('https://')
  && supabaseUrl.includes('.supabase.co')

export const isSupabaseConfigured = Boolean(isValidSupabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (import.meta.env.DEV) {
  console.info('[supabase] config check', {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    isValidSupabaseUrl,
    isSupabaseConfigured,
    supabaseUrlPreview: supabaseUrl ? `${supabaseUrl.slice(0, 32)}...` : null,
  })
}
