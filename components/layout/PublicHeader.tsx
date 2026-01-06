'use client'

import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] py-6 transition-all duration-500">
      <div className="page-shell">
        <div className="glass-card !rounded-full flex items-center justify-between px-8 py-3.5 border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl">
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                <span className="font-black text-xl text-white">C</span>
              </div>
            </div>
            <span className="text-xl font-black text-white tracking-tighter group-hover:text-pink-400 transition-colors">
              Connectly
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-sm font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
                About
              </Link>
              <Link href="/safety" className="text-sm font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
                Safety
              </Link>
            </nav>

            <Link
              href="/auth"
              className="pill-button group !py-2.5 !px-8 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
