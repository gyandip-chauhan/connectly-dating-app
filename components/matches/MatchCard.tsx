// components/matches/MatchCard.tsx
'use client'

import { ChatRoom, UserProfile } from '@/types/database'
import { formatLastOnline } from '@/lib/utils'

interface MatchCardProps {
  match: ChatRoom
  profile: UserProfile
  isSelected: boolean
  onClick: () => void
}

export default function MatchCard({ match, profile, isSelected, onClick }: MatchCardProps) {
  if (!profile) return null

  return (
    <button
      onClick={onClick}
      className={`w-full group relative p-4 rounded-[28px] transition-all duration-500 flex items-center gap-4 text-left border border-transparent ${isSelected
        ? 'bg-white/10 shadow-[0_20px_40px_-4px_rgba(0,0,0,0.3)] ring-1 ring-white/20 border-white/10'
        : 'hover:bg-white/[0.04] hover:border-white/5 active:scale-[0.98]'
        }`}
    >
      {/* Active Glow Indicator */}
      {isSelected && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 bg-pink-500 rounded-full blur-[4px] opacity-60 animate-pulse" />
      )}

      {/* Profile Image Container */}
      <div className="relative flex-shrink-0">
        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[22px] overflow-hidden border-[2.5px] transition-all duration-500 ${isSelected ? 'border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-white/5 group-hover:border-white/20'}`}>
          {profile.profile_picture_url ? (
            <img
              src={profile.profile_picture_url}
              alt={profile.display_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500/40 via-purple-600/40 to-indigo-700/40 flex items-center justify-center">
              <span className="text-white text-xl font-black">
                {profile.display_name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-green-500 border-[3.5px] border-[#0c0a1f] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" title="Online now"></div>
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className={`text-base font-black truncate transition-colors tracking-tight ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
            {profile.display_name}
          </h3>
          {match.last_message_at && (
            <span className="flex-shrink-0 text-[9px] uppercase font-black tracking-[0.2em] text-white/20 truncate">
              {new Date(match.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-hidden">
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest truncate">
            {profile.city || 'The Area'} • {profile.age}
          </p>
          {/* Unread Indicator */}
          {!isSelected && Math.random() > 0.7 && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-pulse"></div>
          )}
        </div>
      </div>
    </button>
  )
}
