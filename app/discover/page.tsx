// app/discover/page.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProfileCard from '@/components/discover/ProfileCard'
import DiscoveryFilters from '@/components/discover/DiscoveryFilters'
import { UserProfile } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sparkles, RotateCw } from 'lucide-react'

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filters, setFilters] = useState<any>({})
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setProfiles([])
      setCurrentIndex(0)
      setLoading(false)
      return
    }

    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters])

  const fetchProfiles = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user's profile first to check preferences
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (!userProfile) {
        console.log('User profile not found')
        return
      }

      // Build query based on filters and user preferences
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id)

      // Apply age filter
      if (filters.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1])
      } else {
        query = query
          .gte('age', userProfile.age_range_min || 18)
          .lte('age', userProfile.age_range_max || 99)
      }

      // Apply gender filter
      if (filters.genders && filters.genders.length > 0) {
        query = query.in('gender', filters.genders)
      } else if (userProfile.interested_in && userProfile.interested_in.length > 0) {
        query = query.in('gender', userProfile.interested_in)
      }

      // Apply interest filters
      if (filters.interests && filters.interests.length > 0) {
        query = query.overlaps('interests', filters.interests)
      }

      const { data, error } = await query.limit(20)

      if (error) throw error
      setProfiles(data || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (direction: 'like' | 'dislike' | 'super_like') => {
    if (currentIndex >= profiles.length || !user) return

    const currentProfile = profiles[currentIndex]
    const swipedUserId = currentProfile.user_id

    console.log('=== SWIPE START ===')
    console.log('Direction:', direction)
    console.log('Swiper (me):', user.id)
    console.log('Swiped:', swipedUserId, currentProfile.display_name)

    // Optimistically update UI first
    setCurrentIndex(prev => prev + 1)

    // Step 1: Record the swipe
    try {
      // First check if swipe already exists
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', user.id)
        .eq('swiped_id', swipedUserId)
        .maybeSingle()

      if (existingSwipe) {
        // Update existing swipe
        const { error: updateError } = await supabase
          .from('swipes')
          .update({ swipe_type: direction, created_at: new Date().toISOString() })
          .eq('id', existingSwipe.id)

        if (updateError) {
          console.error('Error updating swipe:', updateError)
          return
        }
        console.log('Swipe updated successfully')
      } else {
        // Insert new swipe
        const { error: insertError } = await supabase
          .from('swipes')
          .insert({
            swiper_id: user.id,
            swiped_id: swipedUserId,
            swipe_type: direction
          })

        if (insertError) {
          console.error('Error inserting swipe:', JSON.stringify(insertError, null, 2))
          // If it's a duplicate key error, that's okay - just continue
          if (!insertError.message?.includes('duplicate') && !insertError.code?.includes('23505')) {
            return
          }
        }
        console.log('Swipe inserted successfully')
      }
    } catch (err) {
      console.error('Swipe recording failed:', err)
      return
    }

    // Step 2: Check for mutual match (only for likes)
    if (direction === 'dislike') {
      console.log('Dislike - no match check needed')
      return
    }

    try {
      console.log('Checking for mutual swipe...')
      const { data: mutualSwipe, error: matchCheckError } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swipedUserId)
        .eq('swiped_id', user.id)
        .in('swipe_type', ['like', 'super_like'])
        .maybeSingle()

      if (matchCheckError) {
        console.error('Error checking mutual swipe:', matchCheckError)
        return
      }

      if (!mutualSwipe) {
        console.log('No mutual swipe found - not a match yet')
        return
      }

      console.log('MUTUAL MATCH DETECTED!')

      // Step 3: Check if chat room already exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${swipedUserId}),and(user1_id.eq.${swipedUserId},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (existingRoom) {
        console.log('Chat room already exists:', existingRoom.id)
        alert(`You already matched with ${currentProfile.display_name}!`)
        return
      }

      // Step 4: Create chat room
      const { error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: swipedUserId,
          last_message_at: new Date().toISOString()
        })

      if (roomError) {
        console.error('Error creating chat room:', roomError)
        return
      }

      console.log('Chat room created!')
      alert(`🎉 It's a match with ${currentProfile.display_name}! Go to Messages to chat.`)

    } catch (err) {
      console.error('Match check failed:', err)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-brand-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="glass-card max-w-xl p-10 space-y-6">
          <h1 className="heading-xl text-3xl md:text-4xl">Sign in to discover</h1>
          <p className="body-lg text-white/50">
            Create an account to browse curated matches, apply filters, and start making meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" className="btn-primary">
              Sign in
            </Link>
            <Link href="/about" className="btn-ghost">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center px-10 py-12 max-w-md mx-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white/40" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            That's all for now!
          </h2>
          <p className="text-white/50 mb-8">
            Check back later for more profiles or try adjusting your filters.
          </p>
          <button
            onClick={fetchProfiles}
            className="btn-primary"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Refresh Profiles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 pt-28 relative overflow-hidden">
      {/* Immersive Background Depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-pink-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="page-shell max-w-2xl px-6 relative z-10">
        {/* Header Section */}
        <div className="mb-12 flex items-end justify-between animate-in fade-in slide-in-from-top-12 duration-1000">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-0.5 bg-gradient-to-r from-pink-500 to-transparent"></div>
              <p className="uppercase tracking-[0.4em] text-pink-500 text-[10px] font-black italic">Human Curation</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.06em] leading-none mb-2">
              Discover <span className="text-white/20 italic">Depth</span>
            </h1>
            <p className="text-white/30 font-bold tracking-tight px-1">Curated resonances for your unique frequency.</p>
          </div>
          <div className="pb-1">
            <DiscoveryFilters onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        {/* Discovery Arena */}
        <div className="relative h-[700px] w-full perspective-2000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-pink-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse -z-10"></div>

          {profiles.length > 0 && currentIndex < profiles.length ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {profiles.slice(currentIndex, currentIndex + 3).reverse().map((profile, index) => {
                const stackIndex = Math.min(index, 2);
                const isTop = profiles.slice(currentIndex, currentIndex + 3).indexOf(profile) === 0;

                return (
                  <div
                    key={profile.user_id}
                    className="absolute inset-0 animate-in fade-in zoom-in-95 duration-700"
                    style={{
                      zIndex: isTop ? 50 : 50 - stackIndex,
                      transform: `translateY(${stackIndex * 24}px) scale(${1 - stackIndex * 0.05})`,
                      opacity: 1 - stackIndex * 0.3
                    }}
                  >
                    <ProfileCard
                      profile={profile}
                      isActive={isTop}
                      onSwipe={handleSwipe}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            /* Immersive Empty State */
            <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000">
              <div className="glass-card !bg-white/[0.02] !border-white/5 text-center px-12 py-20 max-w-md w-full relative overflow-hidden group/empty">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/10 blur-[80px] rounded-full group-hover/empty:scale-150 transition-transform duration-1000"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-3xl">
                    <Sparkles className="w-12 h-12 text-pink-500/40 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">
                    Horizon Reached
                  </h2>
                  <p className="text-white/30 text-lg font-bold leading-relaxed mb-12">
                    You've explored all current curated connections. Expand your spectral filters or return as the world syncs.
                  </p>
                  <button
                    onClick={fetchProfiles}
                    className="group h-16 px-10 rounded-3xl bg-white text-[#0c0a1f] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
                      Reconnect
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
