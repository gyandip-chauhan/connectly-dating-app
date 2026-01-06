'use client'

import { ChatRoom, UserProfile } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface ChatListProps {
    rooms: ChatRoom[]
    profiles: Record<string, UserProfile>
    currentUserId?: string
    selectedRoomId?: string
    onSelectRoom: (room: ChatRoom) => void
}

export default function ChatList({ rooms, profiles, currentUserId, selectedRoomId, onSelectRoom }: ChatListProps) {

    if (rooms.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                    <span className="text-4xl grayscale opacity-40">💌</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter mb-2">Silence is golden</h3>
                <p className="text-white/30 text-sm leading-relaxed max-w-[200px]">Begin your journey by matching with others in Discover.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 mt-4 anime-reveal">
            {rooms.map((room) => {
                const otherUserId = room.user1_id === currentUserId ? room.user2_id : room.user1_id
                const profile = profiles[otherUserId]

                if (!profile) return null

                const isSelected = selectedRoomId === room.id

                return (
                    <div
                        key={room.id}
                        onClick={() => onSelectRoom(room)}
                        className={`relative p-4 rounded-[28px] cursor-pointer transition-all duration-500 group overflow-hidden ${isSelected
                            ? 'bg-white/[0.08] border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.3)]'
                            : 'bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/5'
                            }`}
                    >
                        {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-pink-500 rounded-r-full shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
                        )}

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl p-[2px] transition-all duration-500 ${isSelected ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                    <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-[#1a1a2e] bg-[#1a1a2e]">
                                        {profile.profile_picture_url ? (
                                            <img
                                                src={profile.profile_picture_url}
                                                alt={profile.display_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
                                                <span className="text-white text-lg font-black">{profile.display_name?.[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-[#0c0a1f] rounded-full"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-base font-black tracking-tight truncate transition-colors ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                        {profile.display_name}
                                    </h3>
                                    {room.last_message_at && (
                                        <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ml-2 transition-colors ${isSelected ? 'text-pink-500' : 'text-white/20'}`}>
                                            {formatDistanceToNow(new Date(room.last_message_at), { addSuffix: false }).replace('about ', '').replace('minutes', 'm').replace('hours', 'h').replace('days', 'd')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate transition-colors ${isSelected ? 'text-white/60' : 'text-white/30'}`}>
                                        Active now • Tap to chat
                                    </p>
                                    {!isSelected && (
                                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
