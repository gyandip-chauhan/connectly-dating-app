'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JournalEntry } from '@/types/database'
import JournalList from '@/components/journal/JournalList'
import JournalEditor from '@/components/journal/JournalEditor'
import { useRouter } from 'next/navigation'

export default function JournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth')
            return
        }
        setUserId(user.id)
        fetchEntries(user.id)
    }

    const fetchEntries = async (uid: string) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching journal:', error)
        } else {
            setEntries(data || [])
        }
        setLoading(false)
    }

    const handleCreateNew = () => {
        setSelectedEntry(null)
        setIsEditing(true)
    }

    const handleSelectEntry = (entry: JournalEntry) => {
        setSelectedEntry(entry)
        setIsEditing(true)
    }

    const handleSaveEntry = async (entryData: Partial<JournalEntry>) => {
        if (!userId) return

        const { error } = await supabase
            .from('journal_entries')
            .upsert({
                ...entryData,
                user_id: userId,
                // updated_at: new Date().toISOString() // Removed as not in schema
            })
            .select()

        if (error) {
            console.error('Error saving entry:', JSON.stringify(error, null, 2))
            alert('Failed to save entry')
        } else {
            await fetchEntries(userId) // Refresh list
            setIsEditing(false) // Or stay in edit mode? Let's close for now or keep selecting it
            // Actually better to keep selecting the new/updated entry
        }
    }

    const handleDeleteEntry = async (id: string) => {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting entry:', error)
            alert('Failed to delete entry')
        } else {
            if (userId) fetchEntries(userId)
            setSelectedEntry(null)
            setIsEditing(false)
        }
    }

    if (loading && !userId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-pink-500 border-r-purple-500 rounded-full animate-spin duration-[2s]"></div>
                    <div className="absolute inset-4 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Synchronizing Resonance</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-28 pb-12 flex flex-col overflow-hidden relative">
            {/* Immersive Background Depth */}
            <div className="absolute top-1/4 -left-64 w-[800px] h-[800px] bg-pink-500/10 blur-[160px] rounded-full animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-64 w-[800px] h-[800px] bg-cyan-400/10 blur-[160px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="page-shell flex-1 flex flex-col max-w-7xl px-8 relative z-10 transition-all duration-1000">
                <div className="flex-1 min-h-0 glass-card !bg-[#0c0a1f]/10 !border-white/5 rounded-[48px] overflow-hidden relative group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
                    {/* Interior Background Accents */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/5 blur-[120px] -mr-64 -mt-64 pointer-events-none transition-opacity duration-1000 group-hover:opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] -ml-64 -mb-64 pointer-events-none transition-opacity duration-1000 group-hover:opacity-40"></div>

                    <div className="flex flex-1 h-full relative z-10">
                        {/* List View (Always visible on Desktop, Hidden on Mobile if Editing) */}
                        <div className={`w-full lg:w-[450px] xl:w-[500px] shrink-0 h-full border-r border-white/5 ${isEditing ? 'hidden lg:block' : 'block'}`}>
                            <JournalList
                                entries={entries}
                                selectedEntryId={selectedEntry?.id}
                                onSelectEntry={handleSelectEntry}
                                onNewEntry={handleCreateNew}
                            />
                        </div>

                        {/* Editor View (Occupies full screen on mobile when active, col-span-2 on desktop) */}
                        <div className={`flex-1 h-full relative overflow-hidden ${isEditing ? 'block' : 'hidden lg:flex flex-col items-center justify-center p-16 lg:bg-white/[0.01]'}`}>
                            {isEditing ? (
                                <div className="h-full animate-in fade-in slide-in-from-right-12 duration-1000">
                                    <JournalEditor
                                        entry={selectedEntry || {}}
                                        userId={userId!}
                                        onSave={handleSaveEntry}
                                        onDelete={handleDeleteEntry}
                                        onCancel={() => setIsEditing(false)}
                                    />
                                </div>
                            ) : (
                                <div className="max-w-2xl text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                                    <div className="relative inline-flex items-center justify-center">
                                        <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                        <div className="relative w-32 h-32 rounded-[40px] bg-white/[0.03] border border-white/10 flex items-center justify-center group/icon transition-transform duration-700 hover:scale-110">
                                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 blur-xl rounded-full opacity-50 group-hover/icon:opacity-100 transition-opacity"></div>
                                            <svg className="w-12 h-12 text-white/20 group-hover/icon:text-pink-500 transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="text-6xl md:text-8xl font-black italic tracking-[-0.06em] text-white">
                                            INNER <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">DIALOGUE</span>
                                        </h2>
                                        <p className="text-[13px] font-bold text-white/30 leading-relaxed uppercase tracking-[0.6em] max-w-lg mx-auto">
                                            Capture the ephemeral frequencies <br /> of your consciousness.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCreateNew}
                                        className="h-20 px-16 rounded-[32px] bg-white/[0.03] border border-white/10 text-white/40 font-black text-[11px] uppercase tracking-[0.5em] hover:bg-white transition-all hover:text-[#0c0a1f] hover:scale-105 active:scale-95 shadow-2xl shadow-black/20"
                                    >
                                        Imprint New Entry
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
