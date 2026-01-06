import { JournalEntry } from '@/types/database'
import { Calendar, Tag, Lock, Globe, Smile } from 'lucide-react'
import { format } from 'date-fns'

interface JournalListProps {
    entries: JournalEntry[]
    selectedEntryId?: string
    onSelectEntry: (entry: JournalEntry) => void
    onNewEntry: () => void
}

export default function JournalList({ entries, selectedEntryId, onSelectEntry, onNewEntry }: JournalListProps) {
    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                <button
                    onClick={onNewEntry}
                    className="relative group w-full h-16 rounded-[28px] bg-white text-[#0c0a1f] font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        New Imprint
                    </span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-8 animate-in fade-in duration-1000">
                        <div className="relative w-24 h-24 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-center group/empty">
                            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000"></div>
                            <Smile className="w-10 h-10 text-white/10 group-hover/empty:text-pink-500/40 transition-colors duration-700" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">The silence is absolute</p>
                            <p className="text-xs font-medium text-white/20 leading-relaxed max-w-[200px] mx-auto uppercase tracking-wider">
                                Your consciousness awaits <br /> its first digital imprint.
                            </p>
                        </div>
                    </div>
                ) : (
                    entries.map((entry, index) => {
                        const isSelected = selectedEntryId === entry.id
                        return (
                            <div
                                key={entry.id}
                                onClick={() => onSelectEntry(entry)}
                                className={`group p-8 rounded-[32px] cursor-pointer transition-all duration-700 border relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000`}
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                {/* Active State Background */}
                                <div className={`absolute inset-0 transition-opacity duration-1000 ${isSelected ? 'bg-gradient-to-br from-pink-500/15 via-purple-600/10 to-cyan-500/5 opacity-100' : 'bg-white/[0.01] opacity-0 group-hover:opacity-100'}`}></div>

                                {/* Ambient Glow */}
                                <div className={`absolute -right-20 -top-20 w-40 h-40 bg-pink-500/10 blur-[60px] rounded-full transition-opacity duration-1000 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>

                                {/* Border Treatment */}
                                <div className={`absolute inset-0 border transition-all duration-700 rounded-[32px] ${isSelected ? 'border-pink-500/40 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]' : 'border-white/5 group-hover:border-white/10'}`}></div>

                                {/* Active Indicator Bar */}
                                {isSelected && (
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[4px] bg-gradient-to-b from-pink-500 to-purple-600 rounded-r-full shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
                                )}

                                <div className="relative z-10 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700 ${isSelected ? 'bg-pink-500/20 text-pink-500' : 'bg-white/[0.03] text-white/20 group-hover:bg-white/5 group-hover:text-white/40 shadow-sm'}`}>
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${isSelected ? 'text-pink-500' : 'text-white/20 group-hover:text-white/40'}`}>
                                                {format(new Date(entry.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className={`font-black uppercase tracking-tight text-xl line-clamp-1 transition-all duration-700 ${isSelected ? 'text-white translate-x-1' : 'text-white/60 group-hover:text-white group-hover:translate-x-1'}`}>
                                            {entry.content.split('\n')[0].slice(0, 40) || 'Untitled Resonance'}
                                        </h3>

                                        <p className={`text-[13px] font-medium leading-relaxed line-clamp-2 transition-all duration-700 ${isSelected ? 'text-white/40' : 'text-white/20 group-hover:text-white/30'}`}>
                                            {entry.content}
                                        </p>
                                    </div>

                                    {/* Bottom Detail */}
                                    <div className={`flex items-center gap-2 pt-2 transition-opacity duration-700 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                                            Synchronized
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
