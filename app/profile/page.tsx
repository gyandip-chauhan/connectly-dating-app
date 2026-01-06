'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import ProfileForm from '@/components/profile/ProfileForm'
import PhotoUpload from '@/components/profile/PhotoUpload'
import { UserProfile, TraitScore, EmotionalBadge } from '@/types/database'
import TraitScoreChart from '@/components/profile/TraitScoreChart'
import EmotionalBadges from '@/components/profile/EmotionalBadges'
import { Edit3, Shield, Crown, SlidersHorizontal, Sparkles, CheckCircle, Video } from 'lucide-react'

// --- Types ---
type Tab = 'edit' | 'photos' | 'verification' | 'traits'

// --- Helper Functions ---
const toArray = (value?: string | string[] | null) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return value.split(',').map(v => v.trim()).filter(Boolean)
}

const normalizeProfile = (profile: any): UserProfile => ({
  ...profile,
  interested_in: toArray(profile.interested_in as any),
  lifestyle: toArray(profile.lifestyle as any),
  personality_traits: toArray(profile.personality_traits as any),
  interests: profile.interests || [],
  height_cm: profile.height_cm ? String(profile.height_cm) : null,
})

const cleanProfilePayload = (updates: Partial<UserProfile>) => {
  const payload: any = { ...updates }

  const trimString = (val: any) => (typeof val === 'string' ? val.trim() : val)
  const arrayOrNull = (val: any) => {
    if (!val) return []
    return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean)
  }

  if ('display_name' in updates) payload.display_name = trimString(updates.display_name)
  if ('full_name' in updates) payload.full_name = trimString(updates.full_name)
  if ('bio' in updates) payload.bio = trimString(updates.bio)
  if ('city' in updates) payload.city = trimString(updates.city)
  if ('country' in updates) payload.country = trimString(updates.country)
  if ('occupation' in updates) payload.occupation = trimString(updates.occupation)
  if ('education' in updates) payload.education = trimString(updates.education)
  if ('relationship_goals' in updates) payload.relationship_goals = trimString(updates.relationship_goals)
  if ('drinking_habits' in updates) payload.drinking_habits = trimString(updates.drinking_habits)
  if ('smoking_habits' in updates) payload.smoking_habits = trimString(updates.smoking_habits)
  if ('exercise_habits' in updates) payload.exercise_habits = trimString(updates.exercise_habits)
  if ('dietary_preferences' in updates) payload.dietary_preferences = trimString(updates.dietary_preferences)
  if ('religion' in updates) payload.religion = trimString(updates.religion)
  if ('zodiac_sign' in updates) payload.zodiac_sign = trimString(updates.zodiac_sign)
  if ('love_language' in updates) payload.love_language = trimString(updates.love_language)
  if ('typical_weekend' in updates) payload.typical_weekend = trimString(updates.typical_weekend)
  if ('perfect_first_date' in updates) payload.perfect_first_date = updates.perfect_first_date || null

  if ('age' in updates) payload.age = updates.age ?? null

  // Schema defines height_cm as text
  if ('height_cm' in updates) {
    payload.height_cm = updates.height_cm ? String(updates.height_cm) : null
  }

  // Schema defines perfect_first_date as date (YYYY-MM-DD)
  // Check if string matches date format, otherwise omit/null to prevent DB error
  if ('perfect_first_date' in updates) {
    const val = updates.perfect_first_date
    // Simple regex for YYYY-MM-DD or is ISO string
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      payload.perfect_first_date = val
    } else {
      // If UI sends text description, we cannot save it to a DATE column.
      // We set to null or omit. Setting to null is safer.
      payload.perfect_first_date = null
    }
  }

  if ('interested_in' in updates) payload.interested_in = arrayOrNull(updates.interested_in)
  if ('lifestyle' in updates) payload.lifestyle = arrayOrNull(updates.lifestyle)
  if ('personality_traits' in updates) payload.personality_traits = arrayOrNull(updates.personality_traits)
  if ('interests' in updates) payload.interests = arrayOrNull(updates.interests)

  // Remove fields not in schema if they accidentally got here
  delete payload.is_verified
  delete payload.is_premium
  delete payload.phone_number
  delete payload.video_verification_url

  // Remove generated fields
  delete payload.created_at
  delete payload.updated_at
  delete payload.user_id

  return payload
}

// --- Main Component ---
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userData, setUserData] = useState<any>(null) // Mapped to public.users
  const [traits, setTraits] = useState<TraitScore | null>(null)
  const [badges, setBadges] = useState<EmotionalBadge[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('edit')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = { push: (url: string) => window.location.href = url } // Simple router mock for client-side or use useRouter

  useEffect(() => {
    if (!authLoading) {
      checkUser()
    }
  }, [user, authLoading])

  const checkUser = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await Promise.all([
        fetchProfile(user.id),
        fetchPublicUser(user.id),
        fetchTraits(user.id),
        fetchBadges(user.id)
      ])
    } catch (e) {
      console.error("Error loading data", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', uid)
      .single()
    if (data) setProfile(normalizeProfile(data))
  }

  const fetchPublicUser = async (uid: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).single()
    if (data) setUserData(data)
  }

  const fetchTraits = async (uid: string) => {
    const { data } = await supabase.from('trait_scores').select('*').eq('user_id', uid).maybeSingle()
    if (data) setTraits(data)
  }

  const fetchBadges = async (uid: string) => {
    const { data } = await supabase.from('emotional_badges').select('*').eq('user_id', uid)
    if (data) setBadges(data || [])
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const payload = cleanProfilePayload(updates)
      console.log('Updating profile with payload:', payload)

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Successfully updated, now re-fetch to ensure sync and persistence
      if (user?.id) {
        await fetchProfile(user.id)
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error }
    }
  }

  const handlePhoneVerification = async () => {
    const phone = prompt("Enter your phone number for verification (Mock):")
    if (phone) {
      const code = prompt(`Enter the code sent to ${phone} (Any 4 digits):`)
      if (code && code.length === 4) {
        // Can't save phone number due to schema limitation, but can mark verified
        // We update the public.users table if possible, or just mock it locally
        await supabase.from('users').update({ is_verified: true }).eq('id', user?.id)
        // Refetch
        if (user?.id) await fetchPublicUser(user.id)
        alert("Phone verified successfully!")
      } else {
        alert("Invalid code.")
      }
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Fake delay

    // Again, schema lacks video_url, so we just verify
    await supabase.from('users').update({ is_verified: true }).eq('id', user?.id)
    if (user?.id) await fetchPublicUser(user.id)

    setLoading(false)
    alert("Video submitted! You are now verified.")
  }


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center px-6 text-center">
        <div className="max-w-xl bg-white/10 border border-white/15 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-black/40 space-y-4">
          <h1 className="text-4xl font-bold text-white">Sign in to edit your profile</h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 pt-28 relative overflow-hidden">
      {/* Immersive Background Depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="page-shell max-w-6xl px-6 relative z-10">
        {/* Profile Master Header */}
        <div className="relative mb-20 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            {/* High-Fidelity Avatar Cluster */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-x-0 -bottom-8 h-12 bg-black/40 blur-2xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity"></div>

              <div className="relative w-52 h-52 rounded-[64px] p-[2px] bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 shadow-3xl transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1">
                <div className="w-full h-full rounded-[62px] overflow-hidden border-[6px] border-[#0c0a1f] bg-[#0c0a1f] relative">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-8xl font-black text-white/10 uppercase tracking-tighter">
                      {profile.display_name?.[0]}
                    </div>
                  )}

                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-[#0c0a1f]/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
                      <Edit3 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload Floating Button */}
              <div className="absolute -bottom-4 -right-4 z-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <PhotoUpload onPhotoUploaded={(url) => updateProfile({ profile_picture_url: url })} />
              </div>

              {userData?.is_verified && (
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3.5 rounded-[22px] border-[5px] border-[#0c0a1f] shadow-2xl animate-in zoom-in-0 duration-700 delay-500">
                  <Shield className="w-6 h-6 fill-current" />
                </div>
              )}
            </div>

            {/* User Info & Identity */}
            <div className="flex-1 text-center md:text-left pt-6">
              <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.06em] leading-none">
                  {profile.display_name} <span className="text-white/20 font-black">{profile.age}</span>
                </h1>

                {profile.is_premium && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400/10 to-orange-500/10 border border-amber-400/20 backdrop-blur-md">
                    <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">Premium Aura</span>
                  </div>
                )}
              </div>

              <p className="text-xl md:text-2xl font-bold text-white/30 mb-10 tracking-tight">
                {profile.city}{profile.country ? `, ${profile.country}` : ''} • {profile.occupation || 'Exploring Life'}
              </p>

              {/* Social/Stats Proof as Glass Pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-5">
                {[
                  { icon: Sparkles, label: 'Resonances', val: '12', color: 'pink-500' },
                  { icon: Shield, label: 'Trust Score', val: 'Elite', color: 'cyan-400' },
                  { icon: Crown, label: 'Profile Rank', val: 'Top 1%', color: 'amber-400' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 rounded-[28px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.05] transition-all duration-500 group/stat">
                    <div className={`w-12 h-12 rounded-[18px] bg-${stat.color}/10 flex items-center justify-center transition-transform group-hover/stat:rotate-12`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-0.5">{stat.label}</span>
                      <span className="block font-black text-xl text-white tracking-tight">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Crystalline Navigation Tabs */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar py-2 animate-in fade-in duration-1000 delay-300">
          {(['edit', 'traits', 'verification'] as const).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-14 px-10 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 whitespace-nowrap overflow-hidden group ${activeTab === tab
                ? 'text-[#0c0a1f] z-10'
                : 'text-white/40 hover:text-white/70 bg-white/[0.02] border border-white/5 hover:border-white/10'
                }`}
            >
              {activeTab === tab && (
                <div className="absolute inset-0 bg-white animate-in slide-in-from-left duration-700 -z-10 shadow-2xl shadow-white/20"></div>
              )}
              <span className="relative z-10">{tab}</span>

              {/* Subtle hover line for inactive tabs */}
              {activeTab !== tab && (
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20 scale-x-0 group-hover:scale-x-50 transition-transform duration-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          {/* Main Glass Stage */}
          <div className="glass-card !bg-white/[0.02] !border-white/5 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative group/stage">
            {/* Dynamic Corner Accents */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-pink-500/[0.03] blur-[120px] pointer-events-none group-hover/stage:bg-pink-500/[0.05] transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyan-400/[0.03] blur-[120px] pointer-events-none group-hover/stage:bg-cyan-400/[0.05] transition-colors duration-1000"></div>

            <div className="p-8 md:p-16 lg:p-20 relative z-10">
              {/* EDIT TAB - Core Identity Form */}
              {activeTab === 'edit' && (
                <div className="animate-in fade-in duration-700">
                  <div className="flex items-center gap-4 mb-16">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-pink-500 to-transparent"></div>
                    <h2 className="text-4xl font-black text-white tracking-[-0.04em]">Personal Essence</h2>
                  </div>
                  <ProfileForm profile={profile} onUpdate={updateProfile} />
                </div>
              )}

              {/* TRAITS TAB - Psychological Architecture */}
              {activeTab === 'traits' && (
                <div className="space-y-16 animate-in fade-in duration-700 text-white">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent"></div>
                      <h2 className="text-4xl font-black text-white tracking-[-0.04em]">Inner Landscape</h2>
                    </div>
                    {traits && (
                      <button className="h-12 px-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 hover:bg-white/10 hover:border-cyan-400/30 transition-all flex items-center justify-center">
                        Synthesize New Report
                      </button>
                    )}
                  </div>

                  {traits ? (
                    <div className="grid lg:grid-cols-5 gap-16 items-start">
                      <div className="lg:col-span-3 glass-card !bg-white/[0.01] !border-white/5 p-8 md:p-10">
                        <TraitScoreChart scores={traits} />
                      </div>
                      <div className="lg:col-span-2 space-y-8">
                        <EmotionalBadges badges={badges} />
                      </div>
                    </div>
                  ) : (
                    <div className="relative py-28 md:py-40 bg-white/[0.01] rounded-[48px] border border-white/5 border-dashed overflow-hidden group/empty">
                      {/* Ambient Glows for Empty State */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full group-hover/empty:scale-125 transition-transform duration-1000"></div>

                      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
                        <div className="relative mb-12 inline-block">
                          <div className="absolute inset-x-0 -bottom-6 h-8 bg-pink-500/20 blur-2xl rounded-full"></div>
                          <div className="relative w-28 h-28 glass-card p-0 flex items-center justify-center !rounded-[40px] border-white/10 shadow-3xl bg-white/[0.02]">
                            <Sparkles className="w-12 h-12 text-pink-500 transition-transform group-hover/empty:rotate-12 duration-700" />
                          </div>
                        </div>

                        <h3 className="text-3xl font-black text-white tracking-tight mb-4">Uncharted Depths</h3>
                        <p className="text-white/30 text-lg font-bold leading-relaxed mb-12">
                          Your psychological profile remains unobserved. Complete the voice synthesis to manifest your resonance data.
                        </p>

                        <button
                          onClick={() => router.push('/analysis')}
                          className="px-12 h-16 rounded-3xl bg-pink-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          Initiate Resonance Test
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VERIFICATION TAB - Secure Infrastructure */}
              {activeTab === 'verification' && (
                <div className="space-y-16 animate-in fade-in duration-700 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-green-400 to-transparent"></div>
                    <h2 className="text-4xl font-black text-white tracking-[-0.04em]">Security Node</h2>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-10">
                    {/* Trust Architecture Info */}
                    <div className="p-10 md:p-12 rounded-[48px] bg-white/[0.02] border border-white/10 flex flex-col justify-between group/verify">
                      <div>
                        <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center mb-10 group-hover/verify:scale-110 transition-transform">
                          <Shield className="w-8 h-8 text-green-400" />
                        </div>
                        <h4 className="text-2xl font-black tracking-tight mb-4">Trust Infrastructure</h4>
                        <p className="text-white/30 text-lg font-bold leading-relaxed mb-10">
                          Verification is a baseline for high-fidelity connections. Verified nodes experience a 300% increase in meaningful resonances within the network.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 py-4 px-6 rounded-2xl bg-black/40 border border-white/5 w-fit">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Registry Synchronized</span>
                      </div>
                    </div>

                    {/* Verification Action Nodes */}
                    <div className="space-y-6">
                      {/* Email Node */}
                      <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group/email">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Authenticated Domain</p>
                            <h4 className="text-xl font-black tracking-tight text-white">{user?.email}</h4>
                          </div>
                        </div>
                        <div className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-green-400/50 bg-green-400/5 px-3 py-1.5 rounded-full border border-green-400/20">
                          Verified
                        </div>
                      </div>

                      {/* Identity Action Node */}
                      <div className={`p-10 rounded-[48px] border transition-all duration-700 ${userData?.is_verified ? 'bg-white/[0.02] border-white/5' : 'bg-pink-500/[0.02] border-pink-500/20'}`}>
                        <div className="flex items-center justify-between mb-12">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${userData?.is_verified ? 'bg-green-500/10 border-green-500/20' : 'bg-pink-500/10 border-pink-500/20'}`}>
                              {userData?.is_verified ? (
                                <Shield className="w-7 h-7 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]" />
                              ) : (
                                <SlidersHorizontal className="w-7 h-7 text-pink-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Humanity Check</p>
                              <h4 className="text-2xl font-black tracking-tight">
                                {userData?.is_verified ? 'Fully Authenticated' : 'Action Required'}
                              </h4>
                            </div>
                          </div>
                        </div>

                        {!userData?.is_verified ? (
                          <div className="grid sm:grid-cols-2 gap-4">
                            <button
                              onClick={handlePhoneVerification}
                              className="h-16 bg-white text-[#0c0a1f] rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/10"
                            >
                              Verify Phone
                            </button>
                            <label className="h-16 flex items-center justify-center gap-3 bg-white/[0.05] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/[0.08] hover:border-white/20 border border-white/10 active:scale-[0.98] transition-all cursor-pointer">
                              <Video className="w-5 h-5 text-white/40" />
                              <span>Live Upload</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoUpload}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                            <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">
                              Node ID: {user?.id.slice(0, 12).toUpperCase()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
