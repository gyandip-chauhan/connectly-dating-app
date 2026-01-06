import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/supabase/server'
import {
  Heart,
  Users,
  Shield,
  Zap,
  Globe,
  Award,
  CheckCircle,
  Sparkles,
  MapPin,
  Lock,
  MessageCircle,
  CalendarDays
} from 'lucide-react'

export default async function AboutPage() {
  const { session } = await getServerSession()

  if (session) {
    redirect('/discover')
  }

  const stats = [
    { number: '50,000+', label: 'Active Members' },
    { number: '120+', label: 'Countries' },
    { number: '89%', label: 'Success Rate' },
    { number: '1.2M+', label: 'Connections Made' }
  ]

  const pillars = [
    {
      icon: Heart,
      title: 'Meaningful by Design',
      description:
        'Compatibility-first matching that looks at personality, values, and lifestyle—never just swipes.'
    },
    {
      icon: Shield,
      title: 'Safety Built In',
      description:
        'Verified profiles, reporting, and moderation so you can focus on connection, not worry.'
    },
    {
      icon: Users,
      title: 'Community First',
      description:
        'Group dates, local events, and shared interests turn online chats into real experiences.'
    },
    {
      icon: Zap,
      title: 'Smart Assistance',
      description:
        'AI-powered prompts, icebreakers, and reminders that keep conversations flowing naturally.'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Tell Us Your Story',
      description: 'Share your values, lifestyle, and what you are looking for. We keep it private and secure.'
    },
    {
      step: 2,
      title: 'Get Curated Matches',
      description: 'Daily matches tuned to compatibility, proximity, and shared interests.'
    },
    {
      step: 3,
      title: 'Talk With Confidence',
      description: 'Guided icebreakers, conversation helpers, and realtime chat powered by Supabase.'
    },
    {
      step: 4,
      title: 'Meet Safely',
      description: 'From video calls to in-person events, safety tools and verification stay with you.'
    }
  ]

  const safety = [
    'Email, phone, and selfie verification',
    'Photo moderation and report handling',
    'Block, restrict, and activity controls',
    'Privacy-first profile visibility settings'
  ]

  const community = [
    {
      icon: MapPin,
      title: 'Local & Global',
      description: 'See people near you or discover matches across 120+ countries.'
    },
    {
      icon: CalendarDays,
      title: 'Events & Meetups',
      description: 'Attend curated group dates, digital mixers, and interest-based meetups.'
    },
    {
      icon: MessageCircle,
      title: 'Guided Icebreakers',
      description: 'Conversation starters that feel natural, not canned, to help you connect faster.'
    }
  ]

  return (
    <div className="min-h-screen">
      <main className="space-y-24 pb-24">
        <section className="pt-16 text-center px-4">
          <div className="container mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 text-white/80 px-4 py-2 rounded-full mb-6 backdrop-blur">
              <Sparkles className="w-4 h-4" />
              <span>Built with Next.js + Supabase</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Dating that feels human, safe, and intentional.
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Connectly blends compatibility-first matching with strong safety tools and community-driven
              experiences. Every feature is designed to help you form genuine relationships, not just matches.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth" className="btn-primary px-8 py-4 text-lg">
                Create your profile
              </Link>
              <Link href="/auth" className="btn-ghost px-8 py-4 text-lg">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-lg py-12" id="mission">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-3">Why we exist</p>
                <h2 className="text-4xl font-bold text-white mb-4">We are rebuilding trust in online dating.</h2>
                <p className="text-white/85 text-lg leading-relaxed">
                  Swiping fatigue, ghosting, and safety concerns have made dating feel transactional. Connectly
                  puts people first with compatibility-focused matching, transparent safety features, and a
                  community that rewards authenticity.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-6 h-6 text-yellow-300" />
                    <span className="text-white font-semibold">Compatibility Engine</span>
                  </div>
                  <p className="text-white/70">
                    Personality, values, and lifestyle signals power our daily match suggestions.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <Globe className="w-6 h-6 text-yellow-300" />
                    <span className="text-white font-semibold">Global by default</span>
                  </div>
                  <p className="text-white/70">
                    120+ countries supported with location-aware discovery and local event programming.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock className="w-6 h-6 text-yellow-300" />
                    <span className="text-white font-semibold">Privacy first</span>
                  </div>
                  <p className="text-white/70">
                    You control what is public. Safety and verification stay visible; the rest is opt-in.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <span className="text-white font-semibold">Supportive product</span>
                  </div>
                  <p className="text-white/70">
                    Nudges, reminders, and smart tips reduce ghosting and keep conversations respectful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4" id="how">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-3">What we believe</p>
            <h2 className="text-4xl font-bold text-white mb-4">Pillars that shape every feature</h2>
            <p className="text-lg text-white/85 max-w-3xl mx-auto">
              We build Connectly around human-first principles: safety, intention, community, and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/70 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-lg py-16" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">How Connectly works</h2>
              <p className="text-lg text-white/85 max-w-2xl mx-auto">
                Four simple steps to go from profile to meaningful connection—with guidance along the way.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {howItWorks.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto text-gray-900 font-bold text-xl">
                      {step.step}
                    </div>
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-yellow-400/30 -translate-x-1/2"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-1/2 space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-green-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Safety & Trust</p>
                  <h2 className="text-3xl font-bold text-white">Protection baked into every step</h2>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed">
                Safety is not a toggle; it is the foundation. Verification, moderation, and reporting flows are
                built with the same care as our matching system.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {safety.map(item => (
                  <div key={item} className="flex items-start space-x-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6" id="safety">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-yellow-300" />
                  <span className="text-white font-semibold">What happens under the hood</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Supabase handles secure authentication, row-level security, and realtime updates. We pair that
                  with moderation queues and proactive safety prompts to keep conversations respectful.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-6 h-6 text-yellow-300" />
                  <span className="text-white font-semibold">Respectful by default</span>
                </div>
                <ul className="space-y-3 text-white/75">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 mt-2 bg-white/70 rounded-full"></span>
                    <span>Conversation nudges discourage ghosting and encourage clarity.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 mt-2 bg-white/70 rounded-full"></span>
                    <span>Availability windows help schedule chats without pressure.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 mt-2 bg-white/70 rounded-full"></span>
                    <span>Photo and profile guidelines keep the community welcoming.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/10 backdrop-blur-lg py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Community that goes beyond chat</h2>
              <p className="text-lg text-white/85 max-w-2xl mx-auto">
                Whether you prefer digital conversations or in-person meetups, Connectly gives you options.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {community.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors duration-300"
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                  <p className="text-white/70 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
            <div className="flex justify-center gap-6 mb-6">
              {stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-300 mb-2">{stat.number}</div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              The numbers matter because the outcomes do: lasting relationships, safer dates, and happier first
              impressions.
            </p>
            <Link
              href="/auth"
              className="btn-primary px-8 py-4 inline-flex items-center justify-center gap-2"
            >
              Join Connectly now
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
