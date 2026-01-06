import { TraitScore } from '@/types/database'

interface TraitScoreChartProps {
    scores?: TraitScore
}

export default function TraitScoreChart({ scores }: TraitScoreChartProps) {
    if (!scores) return null

    const traits = [
        { label: 'Openness', value: scores.openness, color: 'bg-blue-400' },
        { label: 'Conscientiousness', value: scores.conscientiousness, color: 'bg-purple-400' },
        { label: 'Extraversion', value: scores.extraversion, color: 'bg-pink-400' },
        { label: 'Agreeableness', value: scores.agreeableness, color: 'bg-green-400' },
        { label: 'Neuroticism', value: scores.neuroticism, color: 'bg-yellow-400' },
    ]

    return (
        <div className="p-2 space-y-12">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 italic">Psychological Spectrum</h3>
            </div>

            <div className="grid gap-10">
                {traits.map((trait) => (
                    <div key={trait.label} className="group/trait">
                        <div className="flex justify-between items-end mb-4 px-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 group-hover/trait:text-white transition-colors duration-500">{trait.label}</span>
                            <span className="text-lg font-black text-white tracking-tighter">{trait.value || 0}<span className="text-[10px] text-white/20 ml-1">%</span></span>
                        </div>
                        <div className="h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 relative group/bar">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${trait.color} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
                                style={{ width: `${trait.value || 0}%` }}
                            >
                                {/* Glowing tip */}
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm rounded-full"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/5">
                {[
                    { label: 'Fluency', val: scores.emotional_fluency || 0, color: 'white' },
                    { label: 'Positive', val: scores.positive_tone || 0, color: 'cyan-400' },
                    { label: 'Negative', val: scores.negative_tone || 0, color: 'pink-500' }
                ].map((stat, i) => (
                    <div key={i} className="text-center p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">{stat.label}</div>
                        <div className={`text-3xl font-black text-${stat.color} tracking-tighter`}>{stat.val}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { Sparkles } from 'lucide-react'
