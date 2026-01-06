// components/discover/DiscoveryFilters.tsx
'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface DiscoveryFiltersProps {
  onFiltersChange: (filters: any) => void
}

const INTERESTS = [
  'Travel', 'Music', 'Art', 'Sports', 'Reading', 'Cooking', 'Hiking',
  'Photography', 'Dancing', 'Movies', 'Gaming', 'Technology', 'Fitness',
  'Yoga', 'Animals', 'Nature', 'Food', 'Wine', 'Coffee', 'Volunteering'
]

export default function DiscoveryFilters({ onFiltersChange }: DiscoveryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    ageRange: [18, 35],
    maxDistance: 50,
    genders: [] as string[],
    interests: [] as string[],
    verifiedOnly: false,
    onlineNow: false
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleArrayFilter = (key: 'genders' | 'interests', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    const defaultFilters = {
      ageRange: [18, 35],
      maxDistance: 50,
      genders: [],
      interests: [],
      verifiedOnly: false,
      onlineNow: false
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <>
      {/* Crystalline Filter Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 h-14 px-8 rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-700 group backdrop-blur-2xl"
      >
        <Filter className="w-4 h-4 text-white/40 transition-transform group-hover:scale-110 group-hover:text-pink-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">Spectral Filters</span>
        {Object.values(filters).some(filter =>
          Array.isArray(filter) ? filter.length > 0 : filter !== false && filter !== 50
        ) && (
            <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,1)] animate-pulse"></div>
          )}
      </button>

      {/* High-Fidelity Filter Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div
            className="absolute inset-0 bg-[#0c0a1f]/80 backdrop-blur-3xl"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative glass-card max-w-xl w-full max-h-[90vh] overflow-hidden !bg-[#0c0a1f]/60 !border-white/10 flex flex-col shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-700">
            {/* Header: Identity Section */}
            <div className="flex items-center justify-between p-10 md:p-12 border-b border-white/5">
              <div>
                <h2 className="text-4xl font-black text-white tracking-[-0.04em]">Neural Prefs</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">Refining Discovery Resonance</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-14 h-14 bg-white/[0.03] hover:bg-white/[0.08] rounded-[22px] transition-all text-white/20 hover:text-white border border-white/5 flex items-center justify-center group"
              >
                <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Filter Hub */}
            <div className="flex-1 overflow-y-auto p-10 md:p-12 space-y-16 custom-scrollbar">
              {/* Age Spectrum Slider */}
              <div className="space-y-8">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Age Horizon</label>
                  </div>
                  <span className="text-3xl font-black text-pink-500 tracking-tighter italic">{filters.ageRange[0]} — {filters.ageRange[1]}</span>
                </div>
                <div className="flex items-center gap-6 px-2">
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageRange[0]}
                    onChange={(e) => handleFilterChange('ageRange', [parseInt(e.target.value), filters.ageRange[1]])}
                    className="flex-1 accent-pink-500 h-[2px] bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={filters.ageRange[1]}
                    onChange={(e) => handleFilterChange('ageRange', [filters.ageRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-pink-500 h-[2px] bg-white/5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Geographic Reach */}
              <div className="space-y-8">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Proximity Node</label>
                  </div>
                  <span className="text-3xl font-black text-cyan-400 tracking-tighter italic">{filters.maxDistance}km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-[2px] bg-white/5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Identity Resonance Selectors */}
              <div className="space-y-8">
                <label className="block text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Resonating Identities
                </label>
                <div className="flex flex-wrap gap-4">
                  {['Male', 'Female', 'Non-binary', 'Other'].map((gender) => {
                    const active = filters.genders.includes(gender)
                    return (
                      <button
                        key={gender}
                        onClick={() => toggleArrayFilter('genders', gender)}
                        className={`h-14 px-8 rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${active
                          ? 'bg-pink-500 border-pink-500 text-white shadow-2xl shadow-pink-500/20 scale-105'
                          : 'bg-white/[0.02] text-white/30 border-white/5 hover:border-white/20 hover:text-white/60'
                          }`}
                      >
                        {gender}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Passion Spectrum (Chips) */}
              <div className="space-y-8">
                <label className="block text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Passion Patterns
                </label>
                <div className="flex flex-wrap gap-3">
                  {INTERESTS.map((interest) => {
                    const active = filters.interests.includes(interest)
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleArrayFilter('interests', interest)}
                        className={`h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${active
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-xl shadow-cyan-500/20'
                          : 'bg-white/[0.02] text-white/20 border-white/5 hover:border-white/20 hover:text-white/50 hover:bg-white/[0.04]'
                          }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Discrete Optimization Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[
                  { id: 'verifiedOnly', label: 'Verified Nodes', active: filters.verifiedOnly, color: 'emerald-400' },
                  { id: 'onlineNow', label: 'Active Rhythms', active: filters.onlineNow, color: 'blue-400' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleFilterChange(item.id, !item.active)}
                    className={`flex items-center justify-between px-8 py-6 rounded-[32px] border transition-all duration-700 ${item.active
                      ? `bg-${item.color}/5 border-${item.color}/30 shadow-2xl`
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                      }`}
                  >
                    <span className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${item.active ? item.id === 'verifiedOnly' ? 'text-emerald-400' : 'text-blue-400' : 'text-white/20'}`}>
                      {item.label}
                    </span>
                    <div className={`w-6 h-6 rounded-[10px] border flex items-center justify-center transition-all ${item.active ? item.id === 'verifiedOnly' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-blue-500 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10'}`}>
                      {item.active && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Neural Control Footer */}
            <div className="p-10 md:p-12 border-t border-white/5 bg-black/40 flex items-center justify-between gap-10">
              <button
                onClick={clearFilters}
                className="text-[10px] font-black text-white/10 hover:text-white/60 uppercase tracking-[0.5em] transition-all hover:tracking-[0.6em]"
              >
                Reset Matrix
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 h-20 rounded-[32px] bg-white text-[#0c0a1f] text-xs font-black uppercase tracking-[0.5em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="relative z-10">Apply Manifestation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
