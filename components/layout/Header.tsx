// components/layout/Header.tsx
'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bell, Search, Settings, Crown } from 'lucide-react'

export default function Header() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [notifications] = useState(3)
  const supabase = createClient()
  const router = useRouter()

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  return (
    <header className="sticky top-0 z-[60] py-4 transition-all duration-500">
      <div className="page-shell">
        <div className="glass-card !rounded-[28px] flex items-center justify-between px-6 py-3 border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push('/discover')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                <span className="font-black text-lg text-white">C</span>
              </div>
            </div>
            <span className="text-xl font-black text-white tracking-tighter hidden md:block group-hover:text-pink-400 transition-colors">
              Connectly
            </span>
          </div>

          {/* Integrated Search */}
          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/30 group-focus-within:text-pink-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search connections or events..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:bg-white/[0.08] transition-all"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-white/10 border border-white/10 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                  ⌘K
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Premium Status */}
            {profile?.is_premium ? (
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 px-3 py-1.5 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-400/5">
                <Crown className="w-3.5 h-3.5" />
                <span>Premium</span>
              </div>
            ) : (
              <button className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
                <span>Upgrade</span>
              </button>
            )}

            {/* Icons */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 md:pr-4">
              <button className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                )}
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar */}
            <div
              className="flex items-center gap-3 pl-2 md:pl-0 cursor-pointer group"
              onClick={() => router.push('/profile')}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-pink-500/50 to-purple-500/50 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1a1a2e] bg-[#1a1a2e]">
                    {profile?.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt={profile.display_name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{profile?.display_name?.[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#1a1a2e] rounded-full"></div>
              </div>

              <div className="hidden xl:block min-w-0">
                <p className="text-sm font-bold text-white leading-none truncate group-hover:text-pink-400 transition-colors">
                  {profile?.display_name}
                </p>
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest mt-1">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
