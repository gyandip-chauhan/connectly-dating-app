// app/page.tsx
import { getServerSession } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Users, Shield, ArrowRight, Heart } from 'lucide-react'

export default async function Home() {
  const { session } = await getServerSession()

  if (session) {
    redirect('/discover')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[150px] rounded-full animate-float" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 blur-[150px] rounded-full animate-float" style={{ animationDuration: '15s' }} />
      </div>

      <div className="page-shell pt-32 pb-20 relative z-10">

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-32">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
              <span className="text-sm font-medium text-white/90">The Future of Dating is Here</span>
            </div>

            <h1 className="heading-xl mb-6 tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Connect on a <br />
              <span className="text-gradient">Deeper Level</span>
            </h1>

            <p className="body-lg mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Stop swiping broadly. Start connecting deeply.
              Our AI-driven algorithm matches you based on true compatibility,
              shared passions, and energy.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/auth" className="btn-primary w-full sm:w-auto hover:scale-105 active:scale-95">
                Start Matching Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/about" className="btn-ghost w-full sm:w-auto">
                How it Works
              </Link>
            </div>
          </div>

          {/* Hero Visual - Floating Cards */}
          <div className="flex-1 relative w-full max-w-md lg:max-w-xl perspective-1000 hidden md:block">
            <div className="relative w-full aspect-[4/5] animate-float">
              {/* Back Card (Decorative) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] h-full bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm -rotate-6 scale-95" />

              {/* Main Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 rounded-3xl backdrop-blur-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
                {/* Fake Profile Image */}
                <div className="relative w-full h-[65%] rounded-2xl overflow-hidden bg-brand-tertiary group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/40 to-brand-secondary/40 mix-blend-overlay" />
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" alt="Demo Profile" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white">Sarah, 24</h3>
                    <p className="text-white/80 text-sm">Designer • New York</p>
                  </div>
                </div>

                {/* Match Info */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-brand-primary/10 text-brand-primary border border-brand-primary/20">Creative</span>
                      <span className="px-3 py-1 rounded-full text-xs bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20">Travel</span>
                    </div>
                    <div className="text-brand-success font-bold text-sm">98% Match</div>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-gradient-to-r from-brand-primary to-brand-secondary" />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-6 top-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-xl animate-pulse-glow">
                  <Heart className="w-8 h-8 text-brand-primary fill-brand-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: <Sparkles className="w-8 h-8 text-brand-accent" />,
              title: "AI-Powered Matching",
              desc: "Our advanced algorithm learns your type as you interact, delivering better matches every day."
            },
            {
              icon: <Users className="w-8 h-8 text-brand-accent" />,
              title: "Community Events",
              desc: "Join exclusive group dating events and mixers to meet people in a natural, fun setting."
            },
            {
              icon: <Shield className="w-8 h-8 text-brand-accent" />,
              title: "Verified & Safe",
              desc: "Strict verification processes and safety tools ensure you're talking to real people."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 group hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to find your person?</h2>
            <p className="text-xl text-white/70 mb-10">
              Join thousands of others who have found meaningful connections on Connectly.
            </p>
            <Link href="/auth" className="btn-primary w-full sm:w-auto px-12 py-5 text-lg shadow-2xl shadow-brand-primary/40">
              Get Started for Free
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
