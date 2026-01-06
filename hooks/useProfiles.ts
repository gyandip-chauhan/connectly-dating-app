// hooks/useProfiles.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'

export function useProfiles(filters?: any) {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user, filters])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's profile first to check preferences
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (!userProfile) {
        setError('User profile not found')
        return
      }

      // Build query based on filters and user preferences
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id)

      // Apply age filter
      if (filters?.ageRange) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1])
      } else {
        query = query
          .gte('age', userProfile.age_range_min || 18)
          .lte('age', userProfile.age_range_max || 99)
      }

      // Apply gender filter
      if (filters?.genders && filters.genders.length > 0) {
        query = query.in('gender', filters.genders)
      } else if (userProfile.interested_in && userProfile.interested_in.length > 0) {
        query = query.in('gender', userProfile.interested_in)
      }

      // Apply interest filters
      if (filters?.interests && filters.interests.length > 0) {
        query = query.overlaps('interests', filters.interests)
      }

      // Apply lifestyle filters
      if (filters?.lifestyles && filters.lifestyles.length > 0) {
        query = query.overlaps('lifestyle', filters.lifestyles)
      }

      // Apply verification filter
      if (filters?.verifiedOnly) {
        query = query.eq('is_verified', true)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching profiles'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error Loading Profiles',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const swipeProfile = async (swipedUserId: string, swipeType: 'like' | 'dislike' | 'super_like') => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user?.id,
          swiped_id: swipedUserId,
          swipe_type: swipeType
        })

      if (error) throw error

      // Remove swiped profile from local state
      setProfiles(prev =>
        prev.filter(profile => profile.user_id !== swipedUserId)
      )

      // Check for match if it was a like or super like
      if (swipeType === 'like' || swipeType === 'super_like') {
        const { data: mutualSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedUserId)
          .eq('swiped_id', user?.id)
          .in('swipe_type', ['like', 'super_like']) // Check standard like logic
          .maybeSingle()

        if (mutualSwipe) {
          // Create match
          const { data: match, error: matchError } = await supabase
            .from('chat_rooms')
            .insert({
              user1_id: user?.id,
              user2_id: swipedUserId,
              last_message_at: new Date().toISOString()
            })
            .select()
            .single()

          if (matchError) throw matchError

          addToast({
            type: 'success',
            title: "It's a Match!",
            message: 'You have a new match! Start a conversation.'
          })

          return { match, isMatch: true }
        } else if (swipeType === 'super_like') {
          addToast({
            type: 'info',
            title: 'Super Like Sent!',
            message: 'They will be notified of your special interest.'
          })
        }
      }

      return { isMatch: false }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while swiping'
      addToast({
        type: 'error',
        title: 'Swipe Failed',
        message: errorMessage
      })
      return { isMatch: false, error: err }
    }
  }

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    swipeProfile
  }
}
