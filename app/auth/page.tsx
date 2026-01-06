// app/auth/page.tsx
import AuthForm from '@/components/auth/AuthForm'
import { getServerSession } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowLeft } from 'lucide-react'

export default async function AuthPage() {
  const { session } = await getServerSession()

  if (session) {
    redirect('/discover')
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-20 overflow-hidden">
      {/* Background Layer with Grain & Dynamic Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#0c0a1f]">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-500/10 blur-[150px] rounded-full animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full animate-pulse duration-[8s]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="page-shell relative z-10 max-w-7xl px-6">
        <div className="mb-12 animate-in fade-in slide-in-from-left-6 duration-700">
          <Link href="/" className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Origin</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Side - Branding & Core Frequencies */}
          <div className="text-white space-y-12 order-2 lg:order-1 hidden lg:block animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500">Gateway to Resonance</span>
              </div>
              <h1 className="text-5xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                Anchor your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">Frequency</span>
              </h1>
              <p className="text-lg xl:text-xl text-white/40 max-w-lg font-medium leading-relaxed">
                Connectly is a high-fidelity social intelligence engine designed for those who vibrate on a higher wavelength.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Neural Personality Alignment", detail: "Deep-level frequency matching" },
                { label: "Spectral Identity Verification", detail: "Absolute integrity assurance" },
                { label: "High-Resonant Mixers", detail: "Exclusive real-world connections" }
              ].map((feature, i) => (
                <div key={i} className="group flex items-center gap-5 glass-card !bg-white/[0.02] !border-white/5 p-5 rounded-[28px] transition-all hover:bg-white/[0.05] hover:border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Check className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/80">{feature.label}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{feature.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/5">
              {[
                { val: "50K+", label: "Identities" },
                { val: "1.2M", label: "Resonances" },
                { val: "4.9", label: "Alignment" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Auth Focus Area */}
          <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
            <div className="glass-card !bg-white/[0.03] !border-white/10 p-8 md:p-12 lg:p-14 relative overflow-hidden rounded-[48px] shadow-2xl">
              {/* Crystalline Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] -mr-32 -mt-32 pointer-events-none" />

              <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white leading-none">Initiate <span className="text-pink-500">Sync</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Decrypt your credentials</p>
              </div>

              <AuthForm />

              <div className="mt-12 text-center border-t border-white/5 pt-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 leading-relaxed max-w-xs mx-auto">
                  By anchoring, you align with our{' '}
                  <a href="/terms" className="text-pink-500 hover:text-white transition-colors underline underline-offset-4">Protocols</a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-pink-500 hover:text-white transition-colors underline underline-offset-4">Security Directives</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
