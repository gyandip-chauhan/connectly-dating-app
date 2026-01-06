// app/settings/page.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { UserSettings } from '@/types/database'
import { Bell, Shield, Globe, Moon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [activeSection, setActiveSection] = useState('notifications')
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [readonly, setReadonly] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setSettings(null)
      return
    }

    fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) {
        // Table missing or not yet created
        if (error.code === 'PGRST205') {
          setReadonly(true)
          setSettingsError('Settings table is not available. Using local defaults only.')
          setSettings({
            id: 'local-default',
            user_id: user?.id || '',
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            show_online_status: true,
            show_distance: true,
            language: 'en',
            theme: 'light',
            created_at: '',
            updated_at: '',
          })
          return
        }

        if (error.code !== 'PGRST116') throw error
      }

      if (!data) {
        // Create default settings
        const { data: newSettings } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            show_online_status: true,
            show_distance: true,
            language: 'en',
            theme: 'light'
          })
          .select()
          .single()

        setSettings(newSettings)
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings || readonly) return

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user?.id)

      if (error) throw error

      setSettings(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user?.id)

      if (error) throw error

      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const sections = [
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'appearance', icon: Moon, label: 'Appearance' },
    { id: 'language', icon: Globe, label: 'Language' },
    { id: 'account', icon: Trash2, label: 'Account' },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center px-6 text-center">
        <div className="max-w-xl bg-white/10 border border-white/15 rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-black/40 space-y-4">
          <h1 className="text-4xl font-bold text-white">Sign in to manage settings</h1>
          <p className="text-white/80">
            Update notifications, privacy, and account preferences after signing in to Connectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Sign in
            </Link>
            <Link href="/about" className="px-6 py-3 border border-white/40 text-white rounded-full hover:bg-white hover:text-purple-700 transition-colors">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* Immersive Background Depth */}
      <div className="absolute top-1/4 -right-64 w-[800px] h-[800px] bg-pink-500/10 blur-[160px] rounded-full animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-64 w-[800px] h-[800px] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }}></div>

      <div className="page-shell relative z-10 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-pink-500"></div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500/80">Command Center</p>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-[-0.06em] text-white">
              CONTROL <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">SYNC</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Secure via Supabase</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <div className="glass-card !bg-white/[0.01] !border-white/5 p-4 rounded-[40px] space-y-2">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`relative group w-full flex items-center gap-5 px-6 py-5 rounded-[28px] text-left transition-all duration-700 overflow-hidden ${isActive
                        ? 'text-white'
                        : 'text-white/30 hover:text-white/60'
                        }`}
                    >
                      {/* Active Pill Background */}
                      <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-600/20 to-indigo-600/10"></div>
                        <div className="absolute inset-0 border border-white/20 rounded-[28px]"></div>
                      </div>

                      {/* Hover Pill Background */}
                      <div className={`absolute inset-0 bg-white/[0.03] border border-white/5 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? '!opacity-0' : ''}`}></div>

                      <section.icon className={`relative z-10 w-5 h-5 transition-transform duration-700 ${isActive ? 'text-pink-500 scale-110' : 'group-hover:scale-110'}`} />
                      <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">{section.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
            <div className="glass-card !bg-white/[0.01] !border-white/5 p-12 rounded-[48px] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] min-h-[600px]">
              {/* Background Accents */}
              <div className="absolute -right-32 -top-32 w-96 h-96 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors duration-1000"></div>
              <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>

              <div className="relative z-10">
                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <div className="space-y-12">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic tracking-tight text-white uppercase">RESONANCE <span className="text-pink-500">ALERTS</span></h2>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Manage your digital feedback loop</p>
                    </div>

                    <div className="space-y-8 max-w-2xl">
                      {[
                        { id: 'email_notifications', title: 'Stream Synced (Email)', desc: 'Deliver resonance updates to your secure inbox' },
                        { id: 'push_notifications', title: 'Direct Imprint (Push)', desc: 'Real-time frequency flashes to your sensory device' }
                      ].map((pref) => (
                        <div key={pref.id} className="group/item flex items-center justify-between p-8 rounded-[32px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-700">
                          <div className="space-y-1">
                            <h3 className="text-[13px] font-black uppercase tracking-wider text-white/80 transition-colors group-hover/item:text-white">{pref.title}</h3>
                            <p className="text-[11px] font-medium text-white/30 tracking-tight">{pref.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[pref.id as keyof UserSettings] as boolean}
                              onChange={(e) => updateSettings({ [pref.id]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-16 h-8 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-8 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all duration-500 peer-checked:bg-pink-500/20 peer-checked:border-pink-500/40 peer-checked:after:bg-pink-500 peer-checked:after:shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === 'privacy' && (
                  <div className="space-y-12">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic tracking-tight text-white uppercase">SPECTRAL <span className="text-cyan-400">VEIL</span></h2>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Calibrate your digital presence</p>
                    </div>

                    <div className="space-y-8 max-w-2xl">
                      {[
                        { id: 'show_online_status', title: 'Presence Frequency', desc: 'Broadcast your current active state to the network' },
                        { id: 'show_distance', title: 'Spatial Proximity', desc: 'Reveal approximate coordinates to nearby identities' }
                      ].map((pref) => (
                        <div key={pref.id} className="group/item flex items-center justify-between p-8 rounded-[32px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-700">
                          <div className="space-y-1">
                            <h3 className="text-[13px] font-black uppercase tracking-wider text-white/80 transition-colors group-hover/item:text-white">{pref.title}</h3>
                            <p className="text-[11px] font-medium text-white/30 tracking-tight">{pref.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[pref.id as keyof UserSettings] as boolean}
                              onChange={(e) => updateSettings({ [pref.id]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-16 h-8 bg-white/5 border border-white/10 rounded-full peer peer-checked:after:translate-x-8 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all duration-500 peer-checked:bg-cyan-500/20 peer-checked:border-cyan-500/40 peer-checked:after:bg-cyan-400 peer-checked:after:shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Section - Danger Zone */}
                {activeSection === 'account' && (
                  <div className="space-y-12">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black italic tracking-tight text-white uppercase">IDENTITY <span className="text-red-500">TERMINUS</span></h2>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Final protocol directives</p>
                    </div>

                    <div className="max-w-2xl">
                      <div className="relative p-10 rounded-[40px] bg-red-500/[0.02] border border-red-500/20 overflow-hidden group/danger">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
                        <div className="relative z-10 space-y-8">
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-red-500">DANGER PROTOCOL</h3>
                            <p className="text-[13px] font-medium text-red-100/40 leading-relaxed max-w-sm">
                              Once you initiate identity dissolution, your spectral footprint will be permanently purged from the matrix. This action cannot be rescinded.
                            </p>
                          </div>
                          <button
                            onClick={handleDeleteAccount}
                            className="relative group h-16 px-12 rounded-2xl border border-red-500/40 text-red-500 font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 shadow-xl shadow-red-500/10"
                          >
                            Dissolve Identity
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placeholder Sections */}
                {!['notifications', 'privacy', 'account'].includes(activeSection) && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-12 py-20 px-8">
                    <div className="relative group/wait">
                      <div className="absolute inset-0 bg-pink-500/20 blur-[60px] rounded-full scale-150 animate-pulse-slow"></div>
                      <div className="relative w-32 h-32 rounded-[40px] bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-3xl">
                        <span className="text-5xl opacity-40 group-hover/wait:opacity-100 transition-opacity duration-1000">⏳</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-5xl font-black italic tracking-tight text-white uppercase">
                        PHASE <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">PENDING</span>
                      </h3>
                      <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20 leading-relaxed max-w-sm mx-auto">
                        This module is currently <br /> undergoing frequency calibration.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
