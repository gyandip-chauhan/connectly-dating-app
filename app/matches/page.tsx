// app/matches/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom, UserProfile } from '@/types/database'
import MatchCard from '@/components/matches/MatchCard'
import ChatInterface from '@/components/matches/ChatInterface'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MatchesPage() {
  const [matches, setMatches] = useState<ChatRoom[]>([])
  const [selectedMatch, setSelectedMatch] = useState<ChatRoom | null>(null)
  const [matchProfiles, setMatchProfiles] = useState<{ [key: string]: UserProfile }>({})
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setMatches([])
      setSelectedMatch(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchMatches()
    const cleanup = setupRealtimeSubscription()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchMatches = async () => {
    try {
      const { data: matchesData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      setMatches(matchesData || [])

      // Fetch profile data for each match
      if (matchesData && user) {
        const profileIds = matchesData.flatMap(match =>
          [match.user1_id, match.user2_id].filter(id => id !== user.id)
        )

        if (profileIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', profileIds)

          if (profiles) {
            const profilesMap: { [key: string]: UserProfile } = {}
            profiles.forEach(profile => {
              profilesMap[profile.user_id] = profile
            })
            setMatchProfiles(profilesMap)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          fetchMatches()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const [searchTerm, setSearchTerm] = useState('')

  const filteredMatches = matches.filter(match => {
    const otherUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id
    const profile = matchProfiles[otherUserId]
    if (!profile) return false
    return profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.city && profile.city.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0c29]">
        <div className="h-16 w-16 rounded-full border-4 border-white/10 border-t-pink-500 animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a2e] to-[#16213e] flex items-center justify-center px-6 text-center">
        <div className="max-w-xl glass-card p-12 space-y-6">
          <h1 className="text-4xl font-bold text-white">Sign in to view matches</h1>
          <p className="text-white/70">
            Create an account to see who you have matched with, chat in real time, and keep conversations moving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-[600px] pt-28 md:pt-36 flex flex-col overflow-hidden bg-[#0c0a1f]/10 relative">
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10 w-full lg:max-w-[1600px] mx-auto px-0 md:px-4 lg:px-8 pb-0 md:pb-6 gap-0 md:gap-6">
        {/* Sidebar: Matches List */}
        <aside
          className={`w-full md:w-[320px] lg:w-[400px] flex-shrink-0 flex flex-col border-r border-white/5 md:border-none bg-[#0c0a1f]/30 backdrop-blur-3xl transition-all duration-700 ease-in-out absolute md:relative inset-0 z-30 md:translate-x-0 ${selectedMatch ? 'translate-x-[-100%] md:translate-x-0' : 'translate-x-0'
            } md:glass-card !border-white/10 overflow-hidden shadow-2xl`}
        >
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                <h2 className="text-sm font-black text-white/40 tracking-[0.3em] uppercase">Connections</h2>
              </div>
              <span className="bg-pink-500/10 text-pink-400 text-[10px] px-3 py-1 rounded-full font-black tracking-widest border border-pink-500/20">
                {matches.length}
              </span>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-white/10 group-focus-within:text-pink-500 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Find a soul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:bg-white/[0.05] transition-all duration-500 font-bold tracking-tight"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 lg:px-6">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => {
                const otherUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id
                const profile = matchProfiles[otherUserId]

                return (
                  <div
                    key={match.id}
                    className="animate-in fade-in slide-in-from-left-4 duration-700"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <MatchCard
                      match={match}
                      profile={profile}
                      isSelected={selectedMatch?.id === match.id}
                      onClick={() => setSelectedMatch(match)}
                    />
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in duration-1000">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-pink-500/5 blur-[40px] rounded-full animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[40px] flex items-center justify-center text-4xl grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
                    {searchTerm ? '🔍' : '✨'}
                  </div>
                </div>
                <h3 className="text-white font-black text-lg tracking-tight mb-2 uppercase opacity-40">{searchTerm ? 'No results found' : 'Silence is golden'}</h3>
                <p className="text-[11px] leading-relaxed max-w-[180px] mx-auto text-white/20 font-black uppercase tracking-[0.1em]">
                  {searchTerm ? 'Try adjusting your frequency' : 'New echoes will appear here once you match!'}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main
          className={`flex-1 flex flex-col min-w-0 h-full relative z-20 transition-all duration-700 md:glass-card !bg-transparent md:!bg-[#0c0a1f]/20 !border-white/10 shadow-2xl overflow-hidden ${selectedMatch ? 'translate-x-0 opacity-100' : 'translate-x-full md:translate-x-0 opacity-0 md:opacity-100'
            }`}
        >
          {selectedMatch ? (
            <div className="flex-1 flex flex-col h-full min-h-0 w-full overflow-hidden animate-in fade-in duration-500">
              <ChatInterface
                key={selectedMatch.id}
                match={selectedMatch}
                onBack={() => setSelectedMatch(null)}
                otherUserProfile={
                  selectedMatch.user1_id === user?.id
                    ? matchProfiles[selectedMatch.user2_id]
                    : matchProfiles[selectedMatch.user1_id]
                }
              />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-1000 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/[0.02] to-transparent pointer-events-none"></div>

              <div className="relative mb-14">
                <div className="absolute inset-0 bg-pink-500/10 blur-[80px] rounded-full animate-pulse"></div>
                <div className="relative h-48 w-48 glass-card flex items-center justify-center !rounded-[56px] border-white/10 shadow-3xl bg-white/[0.02]">
                  <svg className="w-20 h-20 text-pink-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>

              <div className="max-w-md">
                <h3 className="text-5xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                  Select your <br />
                  <span className="text-pink-500">Connection</span>
                </h3>
                <p className="text-white/20 text-lg leading-relaxed mb-12 font-bold tracking-tight">
                  Start a conversation to explore depth, <br />
                  shared energy, and soulful resonance.
                </p>
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
                  <div className="relative flex h-3 w-3">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400/50 opacity-75"></div>
                    <div className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)]"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Secure Channel Active</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
