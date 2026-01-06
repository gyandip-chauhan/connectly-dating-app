// components/layout/Navigation.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  User,
  LogOut,
  Book,
  Mic
} from 'lucide-react'

export default function Navigation() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const navItems = [
    { href: '/discover', icon: Heart, label: 'Discover' },
    { href: '/matches', icon: MessageCircle, label: 'Matches' },
    { href: '/journal', icon: Book, label: 'Journal' },
    { href: '/analysis', icon: Mic, label: 'Voice' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-fit pointer-events-none">
      <div className="flex items-center gap-1.5 glass-card !rounded-[32px] px-3 py-2.5 border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto border-t-white/20">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-[22px] transition-all duration-500 overflow-hidden ${active
                  ? 'bg-pink-500 shadow-[0_8px_20px_rgba(236,72,153,0.4)]'
                  : 'hover:bg-white/5'
                }`}
            >
              {active && (
                <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              )}
              <item.icon className={`w-5.5 h-5.5 transition-all duration-500 z-10 ${active ? 'text-white scale-110' : 'text-white/40 group-hover:text-white group-hover:scale-110'
                }`} />

              {/* Tooltip (Conditional or hover-based) */}
              <span className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white text-[#0c0a1f] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider`}>
                {item.label}
              </span>
            </Link>
          )
        })}

        <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

        <button
          onClick={handleSignOut}
          className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-[22px] hover:bg-red-500/10 transition-all duration-500 overflow-hidden"
        >
          <LogOut className="w-5.5 h-5.5 text-white/30 group-hover:text-red-400 group-hover:scale-110 transition-all duration-500" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider">
            Logout
          </span>
        </button>
      </div>
    </nav>
  )
}
