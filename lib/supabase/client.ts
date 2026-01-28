import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, env vars may not be available - return a placeholder client
  // that will be properly initialized at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in a browser environment (runtime) vs build time
    if (typeof window !== 'undefined') {
      console.error(
        '⚠️ Missing Supabase environment variables!\n' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
        'For local dev: Add to .env.local\n' +
        'For Docker: Pass via -e flags or docker-compose environment'
      )
    }
    // Return a placeholder client that won't break the build
    // At runtime, this will cause API calls to fail gracefully
    return createSupabaseBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }

  // Only cache when we have valid env vars
  if (!client) {
    client = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}

export function createBrowserClient() {
  return createClient()
}
