// app/groups/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { Group } from '@/types/database'
import { Users, Plus, Search, Lock, MapPin, Shield, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface GroupWithMembership extends Group {
  is_member?: boolean
}

const defaultForm = { name: '', description: '', tags: '', is_public: true, city: '' }

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth()
  const [groups, setGroups] = useState<GroupWithMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setGroups([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchGroups()
  }, [user])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)

      const [{ data: groupsData, error: groupsError }, { data: membershipData }] =
        await Promise.all([
          supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user?.id ?? '')
        ])

      if (groupsError) throw groupsError

      const membershipSet = new Set(membershipData?.map((m: { group_id: string }) => m.group_id) || [])

      setGroups(
        (groupsData || []).map((group) => ({
          ...group,
          is_member: membershipSet.has(group.id),
        }))
      )
    } catch (err: any) {
      console.error('Error fetching groups:', err)
      setError('Unable to load groups right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return groups.filter((group) => {
      const haystack = `${group.name} ${group.description || ''} ${group.city || ''} ${(group.tags || []).join(' ')}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [groups, searchTerm])

  const joinGroup = async (groupId: string) => {
    if (!user) return
    try {
      await supabase
        .from('group_members')
        .upsert({ group_id: groupId, user_id: user.id }, { onConflict: 'group_id,user_id' })

      setGroups(prev =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                is_member: true,
                member_count: (group.member_count || 0) + 1,
              }
            : group
        )
      )
    } catch (err) {
      console.error('Error joining group:', err)
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!user) return
    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      setGroups(prev =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                is_member: false,
                member_count: Math.max((group.member_count || 1) - 1, 0),
              }
            : group
        )
      )
    } catch (err) {
      console.error('Error leaving group:', err)
    }
  }

  const createGroup = async () => {
    if (!user || !form.name.trim()) return
    try {
      setCreating(true)
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        is_public: form.is_public,
        tags: form.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        created_by: user.id,
        city: form.city || null,
      }

      const { error: createError } = await supabase.from('groups').insert(payload)
      if (createError) throw createError

      setForm(defaultForm)
      await fetchGroups()
    } catch (err) {
      console.error('Error creating group:', err)
      setError('Unable to create group. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-center px-6">
        <div className="bg-white/10 border border-white/15 rounded-3xl p-10 backdrop-blur-xl max-w-xl">
          <Users className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Join the community</h1>
          <p className="text-white/80 mb-6">
            Sign in to discover interest-based groups, join meetups, and meet people in safe, verified spaces.
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

  return (
    <div className="min-h-screen pb-32">
      <div className="page-shell py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="uppercase tracking-[0.35em] text-white/60 text-xs mb-2">Groups</p>
            <h1 className="text-4xl font-bold text-white mb-2">Community spaces built for safety</h1>
            <p className="text-white/70">
              Join interest-led groups, attend meetups, and keep conversations aligned with our safety-first principles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
              />
            </div>
            <button
              onClick={createGroup}
              disabled={creating || !form.name.trim()}
              className="flex items-center space-x-2 px-4 py-3 pill-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-white/90 rounded-2xl p-4">
            {error}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-xl shadow-lg shadow-black/30">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Name</p>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                placeholder="Outdoor Adventurers"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Description</p>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                placeholder="Share plans, meet for hikes, and find local trail buddies."
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Tags</p>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                placeholder="hiking, outdoors, fitness"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">City</p>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
                placeholder="San Francisco"
              />
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                  className="rounded border-white/30 bg-transparent"
                />
                <span className="text-sm">Public group</span>
              </label>
              {!form.is_public && (
                <span className="text-xs text-white/70 flex items-center space-x-2">
                  <Lock className="w-4 h-4" /> <span>Requests only</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-white/70">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No groups found</h3>
            <p className="text-white/70 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to create a group in your city.'}
            </p>
            <button
              onClick={createGroup}
              disabled={creating || !form.name.trim()}
              className="px-6 py-3 pill-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create first group
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-colors shadow-xl shadow-black/30"
              >
                <div className="h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 relative">
                  <div className="absolute top-4 left-4 flex items-center space-x-2 text-white/80 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{group.city || 'Remote friendly'}</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center space-x-2 text-white/80 text-sm">
                    {group.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{group.is_public ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                    <p className="text-white/80 text-sm">
                      {(group.tags || []).slice(0, 3).join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-white/80 line-clamp-3">{group.description}</p>

                  <div className="flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count ?? 0} members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Safety-first</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 text-xs text-white/70">
                      {(group.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {group.is_member ? (
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/15 transition-colors text-sm"
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => joinGroup(group.id)}
                        className="px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-300 transition-colors text-sm"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Community promise</p>
            <h3 className="text-2xl font-semibold text-white">Meet authentically, stay safe, feel supported.</h3>
            <p className="text-white/70 mt-2">
              Every group follows our safety and respect standards. Report issues anytime and our team will step in.
            </p>
          </div>
          <Sparkles className="w-10 h-10 text-yellow-300" />
        </div>
      </div>
    </div>
  )
}
