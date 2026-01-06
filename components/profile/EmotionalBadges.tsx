import { EmotionalBadge } from '@/types/database'
import { Award, Star, Zap, Heart, Shield } from 'lucide-react'

interface EmotionalBadgesProps {
    badges?: EmotionalBadge[]
}

export default function EmotionalBadges({ badges }: EmotionalBadgesProps) {
    if (!badges || badges.length === 0) {
        return (
            <div className="relative p-10 rounded-[32px] bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center text-center min-h-[220px] group/empty-b">
                <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center mb-6 transition-transform group-hover/empty-b:rotate-12 duration-700">
                    <Award className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-white/40 font-black text-sm uppercase tracking-widest mb-2">Unearned Honors</p>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Manifest patterns through connection</p>
            </div>
        )
    }

    const getBadgetIcon = (type: string) => {
        const iconClass = "w-6 h-6"
        switch (type.toLowerCase()) {
            case 'empathetic': return <Heart className={`${iconClass} text-pink-500`} />
            case 'good listener': return <Shield className={`${iconClass} text-cyan-400`} />
            case 'energetic': return <Zap className={`${iconClass} text-amber-400`} />
            default: return <Star className={`${iconClass} text-purple-400`} />
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                    <Award className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic">Engagement Honors</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge, i) => (
                    <div key={badge.id} className="group/badge relative p-5 rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-700 overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/[0.05] to-white/0 translate-x-[-100%] group-hover/badge:translate-x-[100%] transition-transform duration-1000"></div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-center transition-transform group-hover/badge:scale-110 group-hover/badge:rotate-6">
                                {getBadgetIcon(badge.badge_type)}
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{badge.badge_type}</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-white/20 rounded-full" style={{ width: `${Math.min(badge.badge_value, 100)}%` }}></div>
                                    </div>
                                    <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">{badge.badge_value} Resonance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
