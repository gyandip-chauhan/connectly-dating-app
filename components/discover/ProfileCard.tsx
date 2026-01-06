// components/discover/ProfileCard.tsx
'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/database'
import { Heart, X, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react'

interface ProfileCardProps {
  profile: UserProfile
  isActive: boolean
  onSwipe: (direction: 'like' | 'dislike' | 'super_like') => void
}

export default function ProfileCard({ profile, isActive, onSwipe }: ProfileCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const swipeDistance = currentX
    if (Math.abs(swipeDistance) > 100) {
      if (swipeDistance > 0) {
        onSwipe('like')
      } else {
        onSwipe('dislike')
      }
    }

    setCurrentX(0)
    setIsDragging(false)
  }

  const rotation = (currentX / 20) * (currentX > 0 ? 1 : -1)
  const likeOpacity = Math.max(0, Math.min(1, currentX / 100))
  const nopeOpacity = Math.max(0, Math.min(1, -currentX / 100))

  return (
    <div
      className={`absolute inset-x-0 mx-auto w-full h-[660px] glass-card !bg-[#0c0a1f]/10 !border-white/5 !rounded-[48px] overflow-hidden transition-all duration-700 origin-bottom select-none group/card ${isActive ? 'cursor-grab active:cursor-grabbing shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] z-20' : 'scale-[0.85] opacity-20 translate-y-12 blur-[2px] pointer-events-none'
        }`}
      style={{
        transform: isActive ? `translateX(${currentX}px) rotate(${rotation}deg)` : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Ambient Background (Inside Card) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover/card:opacity-30 transition-opacity">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-transparent to-indigo-600/10 scale-150 animate-pulse"></div>
      </div>

      {/* High-Fidelity Swipe Indicators */}
      <div
        className="absolute top-16 left-16 border-[3px] border-green-400/80 text-green-400 px-8 py-3 rounded-[24px] font-black text-5xl tracking-[0.2em] uppercase transform -rotate-12 z-30 pointer-events-none shadow-[0_0_40px_rgba(74,222,128,0.3)] backdrop-blur-md bg-green-400/10"
        style={{ opacity: likeOpacity, transform: `translateX(${currentX * 0.1}px) rotate(-12deg)` }}
      >
        RESONATE
      </div>
      <div
        className="absolute top-16 right-16 border-[3px] border-pink-500/80 text-pink-500 px-8 py-3 rounded-[24px] font-black text-5xl tracking-[0.2em] uppercase transform rotate-12 z-30 pointer-events-none shadow-[0_0_40px_rgba(236,72,153,0.3)] backdrop-blur-md bg-pink-500/10"
        style={{ opacity: nopeOpacity, transform: `translateX(${currentX * 0.1}px) rotate(12deg)` }}
      >
        ECLIPSE
      </div>

      {/* Visual Canvas (Image Section) */}
      <div className="relative h-[72%] bg-white/[0.02] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 bg-gradient-to-t from-[#0c0a1f] via-[#0c0a1f]/40 to-transparent" />

        {profile.profile_picture_url ? (
          <img
            src={profile.profile_picture_url}
            alt={profile.display_name}
            className="w-full h-full object-cover pointer-events-none transition-transform duration-[2000ms] group-hover/card:scale-110"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/[0.01]">
            <span className="text-white text-9xl font-black opacity-5 uppercase tracking-tighter">
              {profile.display_name?.[0]}
            </span>
          </div>
        )}

        {/* Identity Cluster Overlay */}
        <div className="absolute bottom-8 left-10 z-20 max-w-[80%]">
          <div className="flex items-baseline gap-4 mb-4">
            <h2 className="text-5xl font-black text-white tracking-[-0.05em] leading-none">
              {profile.display_name}
            </h2>
            <span className="text-3xl font-black text-white/30 tracking-tight">{profile.age}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-xl">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{profile.city}</span>
            </div>
            {profile.occupation && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-xl">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{profile.occupation}</span>
              </div>
            )}
            {profile.is_premium && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 backdrop-blur-2xl rounded-2xl border border-amber-400/20">
                <Star className="w-3 h-3 text-amber-400 fill-current" />
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">Aura</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Soulful Interface (Actions & Passions) */}
      <div className="h-[28%] bg-gradient-to-b from-[#0c0a1f] to-black/60 p-10 flex flex-col justify-between relative z-20">
        {/* Passion Spectrum */}
        <div className="flex flex-wrap gap-2.5">
          {profile.interests?.slice(0, 4).map((interest, i) => (
            <span key={i} className="h-8 px-4 flex items-center rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] transition-all hover:bg-white/[0.05] hover:text-white/60">
              {interest}
            </span>
          ))}
          {(profile.interests?.length || 0) > 4 && (
            <span className="h-8 px-4 flex items-center rounded-xl bg-white/[0.01] border border-white/5 text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">
              +{profile.interests!.length - 4} Spectrum
            </span>
          )}
        </div>

        {/* Neural Actions */}
        <div className="flex items-center justify-between gap-6 pt-6">
          <button
            onClick={() => onSwipe('dislike')}
            className="flex-1 flex items-center justify-center h-18 rounded-[32px] bg-white/[0.02] border border-white/5 text-white/20 hover:bg-white/[0.05] hover:text-white/60 hover:border-white/20 transition-all duration-500 group active:scale-90"
          >
            <X className="w-8 h-8 transition-transform group-hover:rotate-90" />
          </button>

          <button
            onClick={() => onSwipe('super_like')}
            className="w-18 h-18 flex items-center justify-center rounded-[32px] bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-400/20 text-amber-500 shadow-2xl shadow-amber-400/5 hover:bg-amber-400/20 transition-all duration-500 active:scale-90"
          >
            <Star className="w-7 h-7 fill-current transition-transform group-hover:rotate-[72deg]" />
          </button>

          <button
            onClick={() => onSwipe('like')}
            className="flex-1 flex items-center justify-center h-18 rounded-[32px] bg-gradient-to-br from-pink-500 to-indigo-600 text-white shadow-2xl shadow-pink-500/20 hover:brightness-110 transition-all duration-500 group active:scale-90 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Heart className="w-8 h-8 fill-current transition-transform group-hover:scale-125 relative z-10" />
          </button>
        </div>
      </div>
    </div>
  )
}
