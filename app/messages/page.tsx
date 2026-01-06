'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { ChatRoom, UserProfile } from '@/types/database'
import ChatList from '@/components/chat/ChatList'
import ChatWindow from '@/components/chat/ChatWindow'
import { Sparkles, Search } from 'lucide-react'

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setRooms([])
      setProfiles({})
      setSelectedRoom(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchChatRooms()

    // Subscribe to new rooms or updates
    const channel = supabase
      .channel('chat_rooms_list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        () => fetchChatRooms()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const fetchChatRooms = async () => {
    try {
      if (!user) return

      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setRooms(roomsData || [])

      if (roomsData && roomsData.length > 0) {
        const otherIds = roomsData.flatMap(room =>
          [room.user1_id, room.user2_id].filter(id => id !== user.id)
        )

        // Remove duplicates
        const uniqueOtherIds = Array.from(new Set(otherIds))

        if (uniqueOtherIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', uniqueOtherIds)

          if (profileData) {
            const mapped = profileData.reduce<Record<string, UserProfile>>((acc, profile) => {
              acc[profile.user_id] = profile
              return acc
            }, {})
            setProfiles(mapped)
          }
        }

        // Auto-select first room if none selected
        if (!selectedRoom && roomsData.length > 0) {
          setSelectedRoom(roomsData[0])
        }
      } else {
        setSelectedRoom(null)
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = rooms.filter(room => {
    const otherUserId = room.user1_id === user?.id ? room.user2_id : room.user1_id
    const profile = profiles[otherUserId]
    if (!profile) return false
    const haystack = `${profile.display_name} ${profile.city || ''}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-brand-primary animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-gradient flex flex-col items-center justify-center text-center px-6">
        <div className="glass-card p-10 max-w-xl">
          <Sparkles className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Messages await</h1>
          <p className="text-white/80 mb-6">
            Sign in to continue conversations, see your matches, and keep building meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="btn-primary">
              Sign in
            </Link>
            <Link href="/about" className="btn-ghost">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-[#0c0a1f]/10">
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10 w-full">
        {/* Sidebar: Conversations List */}
        <aside className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0c0a1f]/30 backdrop-blur-3xl transition-transform duration-500 absolute md:relative inset-0 z-30 md:translate-x-0 ${selectedRoom ? 'translate-x-[-100%] md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-8 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[1px] bg-pink-500"></span>
              <p className="uppercase tracking-[0.3em] text-pink-500 text-[10px] font-black">Conversations</p>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-8">
              Your <span className="text-white">Messages</span>
            </h1>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/30 group-focus-within:text-pink-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Find a conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
            <ChatList
              rooms={filteredRooms}
              profiles={profiles}
              currentUserId={user.id}
              selectedRoomId={selectedRoom?.id}
              onSelectRoom={setSelectedRoom}
            />
          </div>
        </aside>

        {/* Main Content: Chat Window */}
        <main className={`flex-1 flex flex-col min-w-0 h-full relative z-20 transition-transform duration-500 bg-[#0c0a1f]/5 ${selectedRoom ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {selectedRoom ? (
            <div className="flex-1 flex flex-col h-full min-h-0 w-full overflow-hidden">
              <ChatWindow
                key={selectedRoom.id}
                room={selectedRoom}
                otherUserProfile={
                  profiles[
                  selectedRoom.user1_id === user.id
                    ? selectedRoom.user2_id
                    : selectedRoom.user1_id
                  ]
                }
              />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full"></div>
                <div className="relative h-40 w-40 glass-card flex items-center justify-center !rounded-full border-white/10 shadow-2xl">
                  <Sparkles className="w-16 h-16 text-pink-500 animate-pulse-glow" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-4">
                Deep <span className="text-gradient">Connections</span>
              </h3>
              <p className="text-white/40 text-lg max-w-sm leading-relaxed mb-10">
                Silence is golden, but a conversation is meaningful. Select a match to begin exploring depth.
              </p>
              <Link href="/discover" className="btn-primary">
                Explore Discover
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
