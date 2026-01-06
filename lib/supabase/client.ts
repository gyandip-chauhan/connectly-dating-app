import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseCredentials, getSupabaseFetch } from './config'

export const createClient = () => {
  const { url, anonKey } = getSupabaseCredentials()
  const supabaseFetch = getSupabaseFetch()

  return createBrowserClient(url, anonKey, {
    global: {
      fetch: supabaseFetch,
    },
  })
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return profile
}
