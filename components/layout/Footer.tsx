// components/layout/Footer.tsx
'use client'

import Link from 'next/link'
import { Mail, Instagram, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full mt-24 mb-32">
      <div className="page-shell">
        <div className="glass-card p-10 sm:p-16 border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden relative">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                  <span className="font-black text-xl text-white">C</span>
                </div>
                <div className="text-2xl font-black text-white tracking-tighter">Connectly</div>
              </div>
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Redefining digital intimacy through personality-first connections and meaningful shared experiences.
              </p>
              <div className="flex flex-col gap-4">
                <a href="mailto:hello@connectly.app" className="text-white/40 hover:text-pink-400 font-bold uppercase tracking-widest text-xs transition-colors">
                  hello@connectly.app
                </a>
                <div className="flex items-center gap-3">
                  {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                      <Icon className="w-4.5 h-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-12">
              {[
                {
                  title: 'Product',
                  links: [
                    { label: 'Discover', href: '/discover' },
                    { label: 'Events', href: '/events' },
                    { label: 'Matches', href: '/matches' },
                    { label: 'Analytics', href: '/analysis' }
                  ]
                },
                {
                  title: 'Resources',
                  links: [
                    { label: 'Safety Tips', href: '/safety' },
                    { label: 'Guidlines', href: '/guidelines' },
                    { label: 'Privacy', href: '/privacy' },
                    { label: 'Terms', href: '/terms' }
                  ]
                },
                {
                  title: 'Company',
                  links: [
                    { label: 'About Us', href: '/about' },
                    { label: 'Careers', href: '/careers' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'Contact', href: '/contact' }
                  ]
                }
              ].map((group, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-white text-xs font-black uppercase tracking-[0.2em]">{group.title}</h4>
                  <div className="flex flex-col gap-4">
                    {group.links.map((link, j) => (
                      <Link key={j} href={link.href} className="text-white/40 hover:text-white text-sm font-medium transition-colors">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 mt-16 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              © 2024 Connectly. Built for depth.
            </p>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
