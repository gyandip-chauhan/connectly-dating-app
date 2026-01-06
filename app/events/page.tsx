// app/events/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/types/database'
import EventCard from '@/components/events/EventCard'
import CreateEventModal from '@/components/events/CreateEventModal'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    return event.event_type === filter
  })

  const eventTypes = [...new Set(events.map(event => event.event_type))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-4 border-white/20 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="page-shell py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="uppercase tracking-[0.35em] text-white/60 text-xs mb-2">Events</p>
            <h1 className="text-4xl font-bold text-white mb-2">Immersive group experiences</h1>
            <p className="text-white/70">
              Join curated gatherings to meet new people offline in inspired settings.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 pill-button"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg shadow-black/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-200">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{events.length}</p>
                <p className="text-white/60">Upcoming Events</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg shadow-black/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-200">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {new Set(events.map(e => e.city)).size}
                </p>
                <p className="text-white/60">Cities</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg shadow-black/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-200">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {events.reduce((sum, event) => sum + event.current_participants, 0)}
                </p>
                <p className="text-white/60">Total Participants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
            }`}
          >
            All Events
          </button>
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onEventUpdated={fetchEvents} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-white/70">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No events found
            </h3>
            <p className="text-white/70 mb-6">
              {filter === 'all' 
                ? 'There are no upcoming events at the moment.'
                : `No ${filter} events found.`
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 pill-button"
            >
              Create First Event
            </button>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onEventCreated={fetchEvents}
          />
        )}
      </div>
    </div>
  )
}
