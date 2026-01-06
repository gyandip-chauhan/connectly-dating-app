'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/database'

interface ProfileFormProps {
  profile: UserProfile
  onUpdate: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: any }>
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await onUpdate(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof UserProfile, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || []
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    handleChange(field, newArray)
  }

  const interests = [
    'Travel', 'Music', 'Art', 'Sports', 'Reading', 'Cooking', 'Hiking',
    'Photography', 'Dancing', 'Movies', 'Gaming', 'Technology', 'Fitness',
    'Yoga', 'Animals', 'Nature', 'Food', 'Wine', 'Coffee', 'Volunteering'
  ]

  const lifestyles = [
    'Active', 'Adventurous', 'Homebody', 'Social', 'Minimalist', 'Luxury',
    'Health Conscious', 'Creative', 'Intellectual', 'Spiritual'
  ]

  const personalityTraits = [
    'Adventurous', 'Ambitious', 'Analytical', 'Artistic', 'Caring', 'Confident',
    'Creative', 'Curious', 'Empathetic', 'Energetic', 'Funny', 'Generous',
    'Honest', 'Independent', 'Intellectual', 'Optimistic', 'Organized', 'Passionate'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {message && (
        <div className={`p-8 rounded-[32px] border backdrop-blur-2xl animate-in zoom-in-95 duration-500 ${message.type === 'success'
          ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400 shadow-[0_20px_40px_-5px_rgba(16,185,129,0.1)]'
          : 'bg-red-500/10 border-red-400/20 text-red-400 shadow-[0_20px_40px_-5px_rgba(239,68,68,0.1)]'
          }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/20' : 'bg-red-500/20 text-red-400 border border-red-400/20'}`}>
              {message.type === 'success' ? '✓' : '!'}
            </div>
            <p className="font-black text-xs uppercase tracking-[0.2em]">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Core Identity Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
              <span className="text-pink-500 font-black text-xs">01</span>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Core Identity</h3>
          </div>

          <div className="space-y-8">
            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-pink-500 transition-colors">
                Public Display Name
              </label>
              <input
                type="text"
                required
                value={formData.display_name || ''}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="How the world sees you..."
                className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white placeholder-white/5 focus:outline-none focus:border-pink-500/30 focus:bg-white/[0.04] transition-all duration-500 shadow-inner tracking-tight font-bold"
              />
            </div>

            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-pink-500 transition-colors">
                Authentic Name (Private)
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your anchor name..."
                className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white placeholder-white/5 focus:outline-none focus:border-pink-500/30 focus:bg-white/[0.04] transition-all duration-500 tracking-tight font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-pink-500 transition-colors">
                  Solar Circles (Age)
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white focus:outline-none focus:border-pink-500/30 focus:bg-white/[0.04] transition-all duration-500 font-bold"
                />
              </div>

              <div className="group space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-pink-500 transition-colors">
                  Height (cm)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.height_cm || ''}
                  onChange={(e) => handleChange('height_cm', e.target.value)}
                  className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white focus:outline-none focus:border-pink-500/30 focus:bg-white/[0.04] transition-all duration-500 font-bold"
                />
              </div>
            </div>

            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-pink-500 transition-colors">
                Identity Resonance
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white focus:outline-none focus:border-pink-500/30 focus:bg-white/[0.04] transition-all duration-500 appearance-none cursor-pointer font-bold"
                >
                  <option value="" disabled className="bg-[#0c0a1f]">Select identity</option>
                  <option value="Male" className="bg-[#0c0a1f]">Male</option>
                  <option value="Female" className="bg-[#0c0a1f]">Female</option>
                  <option value="Non-binary" className="bg-[#0c0a1f]">Non-binary</option>
                  <option value="Other" className="bg-[#0c0a1f]">Other</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Positioning Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
              <span className="text-cyan-400 font-black text-xs">02</span>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Global Node</h3>
          </div>

          <div className="space-y-8">
            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-cyan-400 transition-colors">
                Anchor City
              </label>
              <input
                type="text"
                required
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Where do your roots lie?"
                className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white placeholder-white/5 focus:outline-none focus:border-cyan-400/30 focus:bg-white/[0.04] transition-all duration-500 font-bold tracking-tight"
              />
            </div>

            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-cyan-400 transition-colors">
                Life Pursuit (Occupation)
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                placeholder="Your creative endeavor..."
                className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white placeholder-white/5 focus:outline-none focus:border-cyan-400/30 focus:bg-white/[0.04] transition-all duration-500 font-bold tracking-tight"
              />
            </div>

            <div className="group space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-cyan-400 transition-colors">
                Connection Protocol
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.relationship_goals || ''}
                  onChange={(e) => handleChange('relationship_goals', e.target.value)}
                  className="w-full h-16 px-8 bg-white/[0.02] border border-white/5 rounded-[28px] text-white focus:outline-none focus:border-cyan-400/30 focus:bg-white/[0.04] transition-all duration-500 appearance-none cursor-pointer font-bold"
                >
                  <option value="" disabled className="bg-[#0c0a1f]">What are you chasing?</option>
                  <option value="Long-term relationship" className="bg-[#0c0a1f]">Long-term connection</option>
                  <option value="Casual dating" className="bg-[#0c0a1f]">Spontaneous dating</option>
                  <option value="Friendship" className="bg-[#0c0a1f]">Deep friendship</option>
                  <option value="Marriage" className="bg-[#0c0a1f]">Lifelong partnership</option>
                  <option value="Not sure yet" className="bg-[#0c0a1f]">Exploration</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="space-y-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <span className="text-purple-500 font-black text-xs">03</span>
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Personal Narrative</h3>
        </div>

        <div className="group space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-4 group-focus-within:text-purple-500 transition-colors">
            Universal Bio
          </label>
          <textarea
            required
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={6}
            className="w-full px-8 py-6 bg-white/[0.02] border border-white/5 rounded-[40px] text-white placeholder-white/5 focus:outline-none focus:border-purple-500/30 focus:bg-white/[0.04] transition-all duration-700 resize-none leading-relaxed font-bold tracking-tight text-lg"
            placeholder="Tell us about the frequencies you vibrate at, your hidden wonders, and your unique light..."
          />
        </div>
      </div>

      {/* Rhythmic Patterns (Interests & Lifestyle) */}
      <div className="grid lg:grid-cols-2 gap-16 pt-16 border-t border-white/5">
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Interest Spectrum</h3>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/5 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {interests.map(interest => {
              const isActive = (formData.interests || []).includes(interest)
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleArrayChange('interests', interest, !isActive)}
                  className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${isActive
                    ? 'bg-pink-500 text-white border-pink-500 shadow-[0_10px_20px_-5px_rgba(236,72,153,0.3)] scale-105'
                    : 'bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Life Rhythms</h3>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/5 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {lifestyles.map(lifestyle => {
              const isActive = (formData.lifestyle || []).includes(lifestyle)
              return (
                <button
                  key={lifestyle}
                  type="button"
                  onClick={() => handleArrayChange('lifestyle', lifestyle, !isActive)}
                  className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${isActive
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_10px_20px_-5px_rgba(34,211,238,0.3)] scale-105'
                    : 'bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                >
                  {lifestyle}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Preserve Button */}
      <div className="pt-20 flex flex-col items-center gap-8">
        <button
          type="submit"
          disabled={loading}
          className="group relative h-20 px-16 rounded-[32px] bg-white text-[#0c0a1f] font-black text-xs uppercase tracking-[0.4em] transition-all duration-700 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale overflow-hidden shadow-2xl shadow-white/10"
        >
          {/* Animated Gradient Fill */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>

          <span className="relative z-10 flex items-center gap-3">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0c0a1f] border-t-transparent rounded-full animate-spin"></div>
                Synchronizing...
              </>
            ) : 'Preserve Essence'}
          </span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-white/5"></div>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10">
            Node Integrity Secured
          </p>
          <div className="w-8 h-[1px] bg-white/5"></div>
        </div>
      </div>
    </form>
  )
}
