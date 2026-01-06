import { Play, Pause, Activity, Zap, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

interface AnalysisResultProps {
    analysis: {
        transcription: string
        analysis_score: number
        voice_pattern_metrics: any
    }
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const score = analysis.analysis_score
    const metrics = analysis.voice_pattern_metrics

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Score Stage - Immersive Crystalline Centerpiece */}
            <div className="glass-card !bg-white/[0.01] !border-white/5 p-12 md:p-20 overflow-hidden relative group/result shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)]">
                {/* Dynamic Ambient Backgrounds */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-pink-500/[0.04] blur-[150px] -mr-32 -mt-32 pointer-events-none group-hover/result:bg-pink-500/[0.08] transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-400/[0.04] blur-[150px] -ml-32 -mb-32 pointer-events-none group-hover/result:bg-cyan-400/[0.08] transition-all duration-1000"></div>

                <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 gap-16">
                    <div className="flex-1 space-y-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-pink-500/10 border border-pink-500/20 rounded-full backdrop-blur-3xl">
                            <Zap className="w-4 h-4 text-pink-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500">Neural Synthesis Complete</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-[-0.06em] text-white leading-none">
                            Your Vocal <br /><span className="text-white/20">Spectrum</span>
                        </h2>
                        <p className="text-xl text-white/40 max-w-lg font-bold tracking-tight leading-relaxed italic">
                            The matrix has captured your frequency. Your resonance reveals a profound alignment with authenticity, depth, and magnetic presence.
                        </p>
                    </div>

                    <div className="shrink-0 relative">
                        {/* High-Fidelity Score Ring */}
                        <div className="absolute inset-0 bg-pink-500/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/5" />
                                <circle
                                    cx="128" cy="128" r="120"
                                    stroke="url(#gradient-score)" strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={753.98}
                                    strokeDashoffset={753.98 - (753.98 * score) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-[2.5s] ease-out"
                                />
                                <defs>
                                    <linearGradient id="gradient-score" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#818cf8" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-8xl md:text-9xl font-black text-white tracking-tighter">{score}</span>
                                    <span className="text-2xl font-black text-white/20 tracking-tighter">%</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 -mt-2">Resonance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Neural Metrics Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Tone Profile', value: metrics?.tone || 'Resonant', icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                    { label: 'Empathetic Index', value: metrics?.emotion || 'Profound', icon: Heart, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { label: 'Clarity Flux', value: metrics?.clarity || 'Absolute', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' }
                ].map((m, i) => (
                    <div key={i} className="glass-card !bg-white/[0.01] !border-white/5 p-10 md:p-12 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-700 group/metric flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-[24px] ${m.bg} flex items-center justify-center mb-8 border ${m.border} transition-transform group-hover/metric:scale-110 group-hover/metric:rotate-12 duration-700 shadow-2xl`}>
                            <m.icon className={`w-8 h-8 ${m.color}`} />
                        </div>
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">{m.label}</span>
                            <p className="text-3xl font-black text-white tracking-tighter">{m.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sonic Reflection */}
            <div className="glass-card !bg-white/[0.01] !border-white/5 p-12 md:p-16 relative overflow-hidden group/transcription">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-6 text-[120px] font-black text-white/[0.02] leading-none pointer-events-none italic select-none">"</div>
                <div className="absolute bottom-0 left-0 p-6 text-[120px] font-black text-white/[0.02] leading-none pointer-events-none italic select-none rotate-180">"</div>

                <div className="relative z-10 flex flex-col md:flex-row items-baseline gap-12">
                    <div className="flex flex-col items-center shrink-0">
                        <div className="w-[2px] h-12 bg-gradient-to-b from-transparent to-pink-500/50 mb-6"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 vertical-writing-mode md:rotate-180">Reflection</h3>
                    </div>
                    <p className="text-3xl md:text-4xl text-white/60 font-black italic tracking-tight leading-[1.3] relative py-2">
                        "{analysis.transcription}"
                    </p>
                </div>
            </div>

            {/* Final Curation Action */}
            <div className="flex flex-col items-center gap-10 pt-10">
                <button className="group relative h-24 px-20 rounded-[40px] bg-white text-[#0c0a1f] font-black text-xs uppercase tracking-[0.5em] transition-all duration-700 hover:scale-105 active:scale-95 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-4">
                        <Activity className="w-5 h-5" />
                        Anchor Identity
                    </span>
                </button>
                <div className="flex items-center gap-6 opacity-20">
                    <div className="w-12 h-[1px] bg-white"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Neural Integration Secured</p>
                    <div className="w-12 h-[1px] bg-white"></div>
                </div>
            </div>
        </div>
    )
}

import { Heart } from 'lucide-react'
