// hooks/useMatches.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom, UserProfile, ChatMessage } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'

export function useMatches() {
  const [matches, setMatches] = useState<ChatRoom[]>([])
  const [matchProfiles, setMatchProfiles] = useState<{ [key: string]: UserProfile }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchMatches()
      setupRealtimeSubscription()
    }
  }, [user])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: matchesData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      setMatches(matchesData || [])

      // Fetch profile data for each match
      if (matchesData && user) {
        const profileIds = matchesData.flatMap(match =>
          [match.user1_id, match.user2_id].filter(id => id !== user.id)
        )

        if (profileIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', profileIds)

          if (profiles) {
            const profilesMap: { [key: string]: UserProfile } = {}
            profiles.forEach(profile => {
              profilesMap[profile.user_id] = profile
            })
            setMatchProfiles(profilesMap)
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching matches'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error Loading Matches',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          fetchMatches()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const sendMessage = async (matchId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: matchId, // changed from match_id
          sender_id: user?.id,
          content: content.trim(),
          // message_type: 'text' // removed as not in ChatMessage type
        })

      if (error) throw error

      // Update match last message timestamp
      await supabase
        .from('chat_rooms')
        .update({
          last_message_at: new Date().toISOString()
        })
        .eq('id', matchId)

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending message'
      addToast({
        type: 'error',
        title: 'Message Failed',
        message: errorMessage
      })
      return { success: false, error: err }
    }
  }

  const unmatch = async (matchId: string) => {
    // Unmatch is temporarily disabled as chat_rooms table does not support is_active flag
    console.warn('Unmatch functionality is currently unavailable for chat_rooms')
    return { success: false, error: 'Feature unavailable' }

    /* 
    try {
      const { error } = await supabase
        .from('matches')
        .update({ is_active: false })
        .eq('id', matchId)

      if (error) throw error

      setMatches(prev => prev.filter(match => match.id !== matchId))
      
      addToast({
        type: 'success',
        title: 'Match Removed',
        message: 'The match has been removed from your list.'
      })

      return { success: true }
    } catch (err) {
      // ...
    } 
    */
  }

  return {
    matches,
    matchProfiles,
    loading,
    error,
    refetch: fetchMatches,
    sendMessage,
    unmatch
  }
}
