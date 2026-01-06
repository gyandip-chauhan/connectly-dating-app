// hooks/useEvents.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, EventParticipant } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/providers/ToastProvider'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [participations, setParticipations] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
    fetchParticipations()
  }, [user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching events'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error Loading Events',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)

      if (error) throw error

      const participationMap: {[key: string]: boolean} = {}
      data?.forEach(participation => {
        participationMap[participation.event_id] = true
      })
      setParticipations(participationMap)
    } catch (err) {
      console.error('Error fetching participations:', err)
    }
  }

  const toggleParticipation = async (eventId: string) => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to join events.'
      })
      return
    }

    try {
      const isParticipating = participations[eventId]

      if (isParticipating) {
        // Unregister
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)

        if (error) throw error

        setParticipations(prev => ({ ...prev, [eventId]: false }))
        
        addToast({
          type: 'success',
          title: 'Registration Cancelled',
          message: 'You have been removed from the event.'
        })
      } else {
        // Register
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'registered'
          })

        if (error) throw error

        setParticipations(prev => ({ ...prev, [eventId]: true }))
        
        addToast({
          type: 'success',
          title: 'Successfully Registered!',
          message: 'You have been registered for the event.'
        })
      }

      // Refresh events to update participant counts
      fetchEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating registration'
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage
      })
    }
  }

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'organizer_id' | 'current_participants'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          organizer_id: user?.id,
          current_participants: 0
        })
        .select()
        .single()

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Event Created!',
        message: 'Your event has been created successfully.'
      })

      fetchEvents() // Refresh events list
      return { success: true, event: data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating event'
      addToast({
        type: 'error',
        title: 'Event Creation Failed',
        message: errorMessage
      })
      return { success: false, error: err }
    }
  }

  return {
    events,
    participations,
    loading,
    error,
    refetch: fetchEvents,
    toggleParticipation,
    createEvent
  }
}
