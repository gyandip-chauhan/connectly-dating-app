const DEFAULT_SUPABASE_URL = 'https://placeholder.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'public-anon-key'

let hasLoggedWarning = false

export const getSiteUrl = () => {
  const envSite =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim()

  if (envSite) {
    return envSite.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  return vercelUrl ? `https://${vercelUrl.replace(/\/$/, '')}` : undefined
}

const getSupabaseEnv = () => {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  // Server-side fallback for environments that only set private vars.
  const serverUrl = typeof window === 'undefined' ? process.env.SUPABASE_URL?.trim() : undefined
  const serverAnonKey = typeof window === 'undefined' ? process.env.SUPABASE_ANON_KEY?.trim() : undefined

  const url = publicUrl || serverUrl
  const anonKey = publicAnonKey || serverAnonKey

  return { url, anonKey }
}

const isValidSupabaseHost = (url?: string) => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    const isSupabaseDomain =
      hostname.endsWith('.supabase.co') || hostname.endsWith('.supabase.net')
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

    return (
      parsed.protocol.startsWith('http') &&
      (isSupabaseDomain || isLocal)
    )
  } catch {
    return false
  }
}

const getConfigState = () => {
  const { url, anonKey } = getSupabaseEnv()
  const hasUrl = Boolean(url)
  const hasAnonKey = Boolean(anonKey)
  const hasValidAnonKey = Boolean(anonKey && anonKey !== DEFAULT_SUPABASE_ANON_KEY)
  const validHost = isValidSupabaseHost(url)
  const configured =
    hasUrl &&
    hasValidAnonKey &&
    validHost

  return {
    url,
    anonKey,
    configured,
    validHost,
    hasUrl,
    hasAnonKey,
    hasValidAnonKey,
  }
}

export const isSupabaseConfigured = () => getConfigState().configured

export const getSupabaseCredentials = () => {
  // Always read directly from env so updated .env values are used

  const { url, anonKey, validHost } = getConfigState()

  return {
    url: url && validHost ? url : DEFAULT_SUPABASE_URL,
    anonKey: anonKey || DEFAULT_SUPABASE_ANON_KEY,
  }
}

const buildSupabaseWarning = () => {
  const { hasUrl, hasAnonKey, hasValidAnonKey, validHost } = getConfigState()

  if (hasUrl && hasValidAnonKey && validHost) {
    return ''
  }

  const missingVars = [
    !hasUrl ? 'NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)' : '',
    !hasAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)' : '',
  ].filter(Boolean)

  const missingText = missingVars.length
    ? `Missing ${missingVars.join(' and ')}. `
    : ''
  const anonKeyText = hasAnonKey && !hasValidAnonKey
    ? 'Replace the placeholder anon key with your project anon key. '
    : ''
  const hostText = hasUrl && !validHost
    ? 'Supabase URL must be http/https and match your Supabase project (supabase.co/.net or localhost for local dev). '
    : ''

  return `${missingText}${anonKeyText}${hostText}Restart the dev server after updating .env.`
}

const createMockFetch = (): typeof fetch => {
  return async () => {
    const warning = buildSupabaseWarning()

    if (!hasLoggedWarning) {
      console.warn(warning || 'Supabase credentials are not configured.')
      hasLoggedWarning = true
    }

    return new Response(
      JSON.stringify({
        error: 'Supabase not configured',
        hint: warning,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

const mockFetch = createMockFetch()

export const getSupabaseFetch = () =>
  isSupabaseConfigured() ? fetch : mockFetch

export const getSupabaseWarning = () =>
  isSupabaseConfigured() ? '' : buildSupabaseWarning()
