import { createClient }
from "@supabase/supabase-js"

const supabaseUrl =
  process.env
  .NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey =
  process.env
  .NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  createClient(

    supabaseUrl,

    supabaseAnonKey,

    {

      auth: {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,

  storage: {
    getItem: (key) => {
      if (typeof window === "undefined") return null
      return window.sessionStorage.getItem(key)
    },

    setItem: (key, value) => {
      if (typeof window === "undefined") return
      window.sessionStorage.setItem(key, value)
    },

    removeItem: (key) => {
      if (typeof window === "undefined") return
      window.sessionStorage.removeItem(key)
    }
  }
}
    }
  )