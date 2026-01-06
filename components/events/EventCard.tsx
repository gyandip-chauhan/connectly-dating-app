// components/events/EventCard.tsx
'use client'

import { Event } from '@/types/database'
import { MapPin, Calendar, Users, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface EventCardProps {
  event: Event
  onEventUpdated: () => void
}

export default function EventCard({ event, onEventUpdated }: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkRegistration()
  }, [event])

  const checkRegistration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single()

      setIsRegistered(!!data)
    } catch (error) {
      setIsRegistered(false)
    }
  }

  const handleRegister = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isRegistered) {
        // Unregister
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id)
        setIsRegistered(false)
      } else {
        // Register
        await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: user.id,
            status: 'registered'
          })
        setIsRegistered(true)
      }
      
      onEventUpdated()
    } catch (error) {
      console.error('Error updating registration:', error)
    } finally {
      setLoading(false)
    }
  }

  const eventDate = new Date(event.date_time)
  const now = new Date()
  const isPast = eventDate < now
  const isFull = event.max_participants && event.current_participants >= event.max_participants

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:-translate-y-1 transition-transform shadow-xl shadow-black/30">
      {/* Event Image */}
      <div className="h-48 relative">
        <div className="absolute inset-0 brand-gradient opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="absolute top-4 left-4 text-white/80 text-sm capitalize">
          {event.event_type}
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPast 
              ? 'bg-white/20 text-white'
              : isFull
              ? 'bg-red-500/20 text-red-100'
              : 'bg-emerald-500/20 text-emerald-100'
          }`}>
            {isPast ? 'Past' : isFull ? 'Full' : 'Open'}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6 text-white">
        <h3 className="text-xl font-semibold mb-2">
          {event.title}
        </h3>
        
        <p className="text-white/70 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mb-5 text-white/70">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-pink-300" />
            <span className="text-sm">
              {eventDate.toLocaleDateString()} • {eventDate.toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span className="text-sm">{event.address}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="text-sm">
              {event.current_participants}
              {event.max_participants && ` / ${event.max_participants}`} participants
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-300" />
            <span className="text-sm capitalize">{event.event_type}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRegister}
          disabled={loading || isPast || isFull}
          className={`w-full py-3 rounded-2xl font-semibold transition-all ${
            isRegistered
              ? 'bg-white/15 text-white hover:bg-white/25'
              : isPast || isFull
              ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-500/30 hover:brightness-110'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : isRegistered ? (
            'Registered'
          ) : isPast ? (
            'Event Ended'
          ) : isFull ? (
            'Event Full'
          ) : (
            'Register Now'
          )}
        </button>
      </div>
    </div>
  )
}
