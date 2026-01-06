import { useState, useEffect } from 'react'
import { JournalEntry } from '@/types/database'
import { Save, Trash2, X, Tag as TagIcon, Smile, Lock, Globe } from 'lucide-react'

interface JournalEditorProps {
    entry?: Partial<JournalEntry>
    userId: string
    onSave: (entry: Partial<JournalEntry>) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    onCancel: () => void
}

export default function JournalEditor({ entry, userId, onSave, onDelete, onCancel }: JournalEditorProps) {
    const [formData, setFormData] = useState<Partial<JournalEntry>>({
        content: '',
        ...entry
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (entry) {
            setFormData(prev => ({ ...prev, ...entry }))
        }
    }, [entry])

    const handleSave = async () => {
        if (!formData.content) return
        setLoading(true)
        try {
            await onSave({ ...formData, user_id: userId })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!entry?.id || !onDelete) return
        if (confirm('Are you sure you want to delete this entry?')) {
            setLoading(true)
            await onDelete(entry.id)
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-transparent relative">
            {/* Toolbar - Minimalist Crystalline */}
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl relative z-20">
                <div className="flex items-center gap-8">
                    <button
                        onClick={onCancel}
                        className="p-4 rounded-[20px] hover:bg-white/5 text-white/20 hover:text-white transition-all lg:hidden border border-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {formData.id && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>}
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">
                                {formData.id ? 'Refining Imprint' : 'New Resonance'}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/20">
                            {formData.id ? 'Synchronizing digital frequency...' : 'Ready to anchor consciousness'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {formData.id && onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-4 rounded-[20px] hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all group border border-white/5 hover:border-red-500/20"
                            title="Purge Imprint"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || !formData.content}
                        className="relative group overflow-hidden h-16 px-12 rounded-[28px] bg-white text-[#0c0a1f] font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? <div className="w-4 h-4 border-2 border-[#0c0a1f]/30 border-t-[#0c0a1f] rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                            {loading ? 'Anchoring...' : 'Anchor Now'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Editor Area - Zen Immersion */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                <div className="max-w-4xl mx-auto w-full px-10 py-24 md:py-32">
                    <div className="relative group/editor">
                        {/* Decorative Quote Mark */}
                        <div className="absolute -left-16 -top-16 text-[160px] font-black text-white/[0.02] leading-none pointer-events-none select-none italic group-focus-within/editor:text-pink-500/5 transition-all duration-1000 select-none">"</div>

                        {/* Background Pulse during typing */}
                        <div className="absolute inset-0 bg-pink-500/0 blur-[100px] rounded-full pointer-events-none group-focus-within/editor:bg-pink-500/[0.02] transition-colors duration-1000"></div>

                        <textarea
                            value={formData.content || ''}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Release your thoughts into the frequency..."
                            className="w-full min-h-[600px] bg-transparent text-2xl md:text-4xl leading-[1.6] text-white/80 placeholder-white/5 border-none outline-none resize-none font-medium custom-scrollbar selection:bg-pink-500/30 transition-all group-focus-within/editor:text-white tracking-tight"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Polish */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0c0a1f]/40 to-transparent pointer-events-none z-20"></div>
        </div>
    )
}
