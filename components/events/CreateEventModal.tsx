// components/events/CreateEventModal.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface CreateEventModalProps {
  onClose: () => void
  onEventCreated: () => void
}

export default function CreateEventModal({ onClose, onEventCreated }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Social',
    address: '',
    city: '',
    date_time: '',
    max_participants: 20
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('events')
        .insert({
          ...formData,
          organizer_id: user.id,
          current_participants: 0,
          is_active: true
        })

      if (error) throw error

      onEventCreated()
      onClose()
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const eventTypes = [
    'Social',
    'Speed Dating',
    'Outdoor',
    'Cooking',
    'Sports',
    'Cultural',
    'Networking',
    'Other'
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080416]/95 border border-white/15 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Create New Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent resize-none"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Event Type *
              </label>
              <select
                required
                value={formData.event_type}
                onChange={(e) => handleChange('event_type', e.target.value)}
                className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Max Participants
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={formData.max_participants}
                onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date_time}
              onChange={(e) => handleChange('date_time', e.target.value)}
              className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
              placeholder="Event location address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-white/15 bg-white/5 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-transparent"
              placeholder="City"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/15 text-white/80 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 pill-button disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-90"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
