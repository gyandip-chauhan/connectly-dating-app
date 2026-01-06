'use client'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured, getSupabaseWarning, getSiteUrl } from '@/lib/supabase/config'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Calendar, MapPin, Heart } from 'lucide-react'

export default function AuthForm() {
  const supabase = createClient()
  const router = useRouter()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [manualSignup, setManualSignup] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    age: '',
    gender: '',
    city: '',
    relationship_goals: ''
  })
  const authRedirectTo = useMemo(() => {
    const siteUrl = getSiteUrl()
    return siteUrl ? `${siteUrl}/auth/callback` : undefined
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session?.user?.id)
          .single()

        if (profile) {
          router.push('/discover')
        } else {
          // Profile missing (new signup or interrupted setup)
          // Attempt to create/hydrate from metadata
          if (session?.user) {
            await createProfile(session.user)
          } else {
            router.push('/profile/setup')
          }
        }
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase, manualSignup])

  const createProfile = async (user: any) => {
    try {
      const meta = user.user_metadata || {}

      // 1. Ensure public.users record exists
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          password_hash: 'managed_by_supabase_auth', // Placeholder as actual auth is handled by Supabase
          updated_at: new Date().toISOString(),
          // Default fields
          is_verified: false
        }, { onConflict: 'id' })

      if (userError) {
        console.error('Error creating public user record:', userError)
        // non-blocking, try to create profile anyway
      }

      // 2. Create Profile
      // Prioritize metadata (persisted), fall back to formData (immediate state)
      const displayName = meta.display_name || formData.display_name.trim()
      const age = meta.age ? Number(meta.age) : (formData.age ? Number(formData.age) : null)
      const gender = meta.gender || formData.gender || null
      const city = meta.city || formData.city.trim()
      const relationshipGoals = meta.relationship_goals || formData.relationship_goals || null

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          display_name: displayName,
          age: age,
          gender: gender,
          city: city,
          relationship_goals: relationshipGoals,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      router.push('/discover')
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!isSupabaseConfigured()) {
      setErrorMessage(getSupabaseWarning())
      return
    }

    setLoading(true)

    try {
      // 1. Sign up with Supabase Auth
      // We store all initial profile data in user_metadata so it persists 
      // even after the email verification redirect (when local React state is lost).
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.display_name,
            age: formData.age ? Number(formData.age) : null,
            gender: formData.gender,
            city: formData.city,
            relationship_goals: formData.relationship_goals,
            // Add any other fields you want to initialize
          },
          emailRedirectTo: authRedirectTo,
        }
      })

      if (error) throw error

      if (data.user) {
        // Optimistically create profile/user record if we can (e.g. if auto-confirm is on)
        // But the robust check is in the useEffect listener.
        setManualSignup(true)
      }
    } catch (error: any) {
      console.error('Error signing up:', error)
      const message =
        (error?.name === 'AuthRetryableFetchError' || /Failed to fetch/i.test(error?.message || ''))
          ? `Supabase could not be reached. Confirm NEXT_PUBLIC_SUPABASE_URL is correct and ${getSiteUrl() || 'your site URL'} (plus /auth/callback) is added under Auth → URL Configuration in your Supabase project.`
          : error?.message ||
          error?.error_description ||
          'Signup failed. Please confirm your Supabase credentials and try again.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleView = () => {
    setView(view === 'sign_in' ? 'sign_up' : 'sign_in')
    setManualSignup(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest backdrop-blur-md animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">!</div>
            {errorMessage}
          </div>
        </div>
      )}

      {!manualSignup ? (
        <>
          {/* Social Auth Options - Crystalline Finish */}
          <div className="space-y-4">
            <button
              onClick={async () => {
                setLoading(true)
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: authRedirectTo,
                  },
                })
              }}
              className="group w-full flex items-center justify-center space-x-4 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] text-white hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10">Sync with Google</span>
            </button>

            <button
              onClick={async () => {
                setLoading(true)
                await supabase.auth.signInWithOAuth({
                  provider: 'facebook',
                  options: {
                    redirectTo: authRedirectTo,
                  },
                })
              }}
              className="group w-full flex items-center justify-center space-x-4 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] text-white hover:bg-white/[0.06] hover:border-white/20 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10">Sync with Facebook</span>
            </button>
          </div>

          {/* Divider - Polished */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-6 bg-[#0c0a2a] text-white/20 font-black uppercase tracking-[0.5em]">Manual Protocol</span>
            </div>
          </div>

          {/* Manual Auth Form */}
          {view === 'sign_up' ? (
            <form onSubmit={handleManualSignup} className="space-y-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Identity Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={formData.display_name}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white placeholder-white/10 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs"
                        placeholder="Public handle"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Contact Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white placeholder-white/10 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs"
                        placeholder="Email frequency"
                      />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Access Cipher</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-14 pr-14 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white placeholder-white/10 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs"
                      placeholder="Secure passphrase"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Linear Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                      <input
                        type="number"
                        required
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white placeholder-white/10 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs"
                        placeholder="18+"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Identity Spectrum</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0c0a1f]">Select identity</option>
                      <option value="Male" className="bg-[#0c0a1f]">Male</option>
                      <option value="Female" className="bg-[#0c0a1f]">Female</option>
                      <option value="Non-binary" className="bg-[#0c0a1f]">Non-binary</option>
                      <option value="Other" className="bg-[#0c0a1f]">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Current Anchor</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white placeholder-white/10 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs"
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 px-2 group-focus-within:text-pink-500 transition-colors">Manifested Intent</label>
                    <div className="relative">
                      <Heart className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                      <select
                        required
                        value={formData.relationship_goals}
                        onChange={(e) => handleInputChange('relationship_goals', e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-[20px] text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-xs appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0c0a1f]">Looking for...</option>
                        <option value="Long-term relationship" className="bg-[#0c0a1f]">Long-term Connection</option>
                        <option value="Casual dating" className="bg-[#0c0a1f]">Spontaneous Dating</option>
                        <option value="Friendship" className="bg-[#0c0a1f]">Soulful Friendship</option>
                        <option value="Not sure yet" className="bg-[#0c0a1f]">Open Exploration</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative group w-full py-5 rounded-[24px] bg-white text-[#0c0a1f] font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5 disabled:opacity-50 disabled:grayscale"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-3 h-3 border-2 border-[#0c0a1f]/10 border-t-[#0c0a1f] rounded-full animate-spin"></div>
                    <span>Anchoring Profile...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Initiate Imprint</span>
                )}
              </button>
            </form>
          ) : (
            /* Sign In Form - Crystalline Theme */
            <div className="sign-in-container animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#ec4899',
                        brandAccent: '#ec4899',
                        brandButtonText: '#0c0a1f',
                        defaultButtonBackground: 'rgba(255, 255, 255, 0.03)',
                        defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.06)',
                        defaultButtonBorder: 'rgba(255, 255, 255, 0.1)',
                        defaultButtonText: 'white',
                        inputBackground: 'rgba(255, 255, 255, 0.03)',
                        inputBorder: 'rgba(255, 255, 255, 0.1)',
                        inputText: 'white',
                        inputLabelText: 'rgba(255, 255, 255, 0.2)',
                        inputPlaceholder: 'rgba(255, 255, 255, 0.1)',
                        anchorTextColor: 'rgba(255, 255, 255, 0.4)',
                        anchorTextHoverColor: 'white',
                        messageText: '#ec4899',
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '24px',
                        buttonBorderRadius: '24px',
                        inputBorderRadius: '20px',
                      },
                      fonts: {
                        bodyFontFamily: `inherit`,
                        inputFontFamily: `inherit`,
                        buttonFontFamily: `inherit`,
                        labelFontFamily: `inherit`,
                      }
                    },
                  },
                }}
                theme="dark"
                providers={[]}
                view="sign_in"
                redirectTo={authRedirectTo}
              />
            </div>
          )}

          {/* Switch Auth Mode - Polished */}
          <div className="text-center pt-8 border-t border-white/5">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
              {view === 'sign_in' ? "New to the grid? " : "Already anchored? "}
              <button
                onClick={toggleView}
                className="text-pink-500 hover:text-white font-black transition-colors ml-2"
              >
                {view === 'sign_in' ? 'Initialize' : 'Resume Search'}
              </button>
            </p>
          </div>
        </>
      ) : (
        /* Success Message - Premium Crystalline */
        <div className="text-center py-12 space-y-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="w-24 h-24 bg-white/[0.03] border border-emerald-500/30 rounded-[32px] flex items-center justify-center relative overflow-hidden group">
              <svg className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight text-white">Transmission <span className="text-emerald-400">Sent</span></h3>
            <p className="text-sm font-medium text-white/40 leading-relaxed">
              A spectral link has been dispatched to <br />
              <span className="text-white font-bold">{formData.email}</span>
            </p>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[28px]">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 leading-relaxed font-mono">
              Decrypt the link to verify your identity and finalize your frequency mapping.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
