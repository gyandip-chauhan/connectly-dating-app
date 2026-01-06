// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getSupabaseCredentials, getSupabaseFetch } from './config'

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseCredentials()
  const supabaseFetch = getSupabaseFetch()

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        fetch: supabaseFetch,
      },
    }
  )
}

type ServerClient = Awaited<ReturnType<typeof createClient>>

export async function getServerSession(): Promise<{
  supabase: ServerClient
  session: Session | null
  error: Error | null
}> {
  const supabase = await createClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return { supabase, session, error: null }
  } catch (error) {
    console.error('Failed to fetch Supabase session:', error)
    return {
      supabase,
      session: null,
      error: error instanceof Error ? error : new Error('Unknown Supabase error'),
    }
  }
}
