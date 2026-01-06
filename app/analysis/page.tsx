'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AudioUploader from '@/components/analysis/AudioUploader'
import AnalysisResult from '@/components/analysis/AnalysisResult'
import { Mic, Info, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AudioAnalysisPage() {
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleUpload = async (file: File) => {
        setAnalyzing(true)
        setError(null)

        try {
            // 1. Check Auth
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }

            // 2. Simulate Upload (In real app, upload to storage bucket)
            // await supabase.storage.from('audio').upload(...)
            const mockAudioUrl = `https://connectly-storage.com/audio/${user.id}/${Date.now()}.mp3`

            // 3. Simulate Analysis Delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // 4. Generate Mock Data
            const mockScore = Math.floor(Math.random() * 20) + 80 // 80-99
            const mockMetrics = {
                tone: ['Warm', 'Confident', 'Energetic', 'Calm'][Math.floor(Math.random() * 4)],
                emotion: ['Positive', 'Sincere', 'Playful', 'Thoughtful'][Math.floor(Math.random() * 4)],
                clarity: 'High',
                pitch_variance: 'Dynamic'
            }
            const mockTranscription = "Hey there! I'm really excited to try this app. I love hiking and exploring new coffee shops on weekends. Looking forward to meeting someone who shares my passion for adventure!"

            const analysisData = {
                user_id: user.id,
                audio_url: mockAudioUrl,
                fluency_score: mockScore,
                transcription: mockTranscription,
                emotional_tones: mockMetrics
            }

            // 5. Insert Audio Analysis
            const { data, error: dbError } = await supabase
                .from('audio_analysis')
                .insert(analysisData)
                .select()
                .single()

            if (dbError) throw dbError

            // 6. Update Trait Scores (Delete old, insert new to ensure single record)
            await supabase.from('trait_scores').delete().eq('user_id', user.id)

            await supabase.from('trait_scores').insert({
                user_id: user.id,
                openness: Math.floor(Math.random() * 40) + 60,
                conscientiousness: Math.floor(Math.random() * 40) + 60,
                extraversion: Math.floor(Math.random() * 40) + 60,
                agreeableness: Math.floor(Math.random() * 40) + 60,
                neuroticism: Math.floor(Math.random() * 30),
                emotional_fluency: Math.floor(Math.random() * 40) + 60,
                positive_tone: Math.floor(Math.random() * 40) + 60,
                negative_tone: Math.floor(Math.random() * 20),
                analysis_date: new Date().toISOString()
            })

            // 7. Award Badge
            await supabase.from('emotional_badges').insert({
                user_id: user.id,
                badge_type: 'Voice Charisma',
                badge_value: mockScore,
                awarded_at: new Date().toISOString(),
                context: 'Audio Analysis Result'
            })

            if (dbError) throw dbError

            setResult(data)

        } catch (err: any) {
            console.error('Analysis failed:', err)
            setError(err.message || 'Failed to analyze audio. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen pb-32 pt-28 relative overflow-hidden">
            {/* Immersive Background Depth */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-pink-500/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-cyan-400/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '-3s' }}></div>
            </div>

            <div className="page-shell max-w-4xl px-6 relative z-10">
                {/* Editorial Header Section */}
                <div className="text-center mb-24 animate-in fade-in slide-in-from-top-12 duration-1000">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 mb-12 relative group/mic">
                        <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full opacity-0 group-hover/mic:opacity-100 transition-opacity duration-700"></div>
                        <Mic className="w-10 h-10 text-pink-500 relative z-10 transition-transform group-hover/mic:scale-110" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-[-0.08em] text-white leading-none mb-8">
                        Sonic <span className="text-white/20">Identity</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/30 max-w-2xl mx-auto font-bold tracking-tight leading-relaxed">
                        Manifest your vocal frequency. Our neural matrix decodes the hidden rhythms of your essence to synthesize your unique resonance report.
                    </p>
                </div>

                {error && (
                    <div className="mb-12 p-10 bg-red-500/10 border border-red-500/20 rounded-[40px] text-red-500 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-700 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Info className="w-6 h-6" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-[0.4em]">{error}</p>
                    </div>
                )}

                {/* Main Action Stage */}
                {!result && !analyzing && (
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                        <div className="glass-card !bg-white/[0.01] !border-white/5 overflow-hidden relative group/stage shadow-[0_60px_100px_-30px_rgba(0,0,0,0.6)]">
                            {/* Inner Glows */}
                            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-pink-500/[0.03] blur-[120px] pointer-events-none group-hover/stage:bg-pink-500/[0.05] transition-colors duration-1000"></div>

                            <div className="p-10 md:p-20 relative z-10">
                                <AudioUploader onUpload={handleUpload} />

                                <div className="mt-16 flex flex-col md:flex-row items-center gap-10 p-10 bg-white/[0.02] border border-white/5 rounded-[48px] transition-all hover:bg-white/[0.04] hover:border-white/10">
                                    <div className="w-16 h-16 rounded-3xl bg-cyan-400/10 flex items-center justify-center shrink-0 border border-cyan-400/20 shadow-xl">
                                        <Info className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <div className="space-y-3 text-center md:text-left">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 italic">Vocal Guidelines</h4>
                                        <p className="text-lg text-white/40 leading-relaxed font-bold tracking-tight">
                                            Speak naturally for 15-20 seconds. Imagine sharing a thought with a kindred soul. Your true frequency reveals itself in the moments between words.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Immersive Neural Processing State */}
                {analyzing && (
                    <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-1000">
                        <div className="relative w-56 h-56 mb-16">
                            {/* Orbital Rings */}
                            <div className="absolute inset-0 border-[3px] border-white/5 rounded-[72px] animate-spin-slow"></div>
                            <div className="absolute inset-4 border-[3px] border-white/5 rounded-[60px] animate-spin-slow-reverse" style={{ animationDuration: '6s' }}></div>

                            {/* Core Crystalline Hub */}
                            <div className="absolute inset-10 bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-cyan-400/20 rounded-[48px] animate-pulse opacity-60 blur-2xl"></div>
                            <div className="absolute inset-10 bg-white/[0.05] backdrop-blur-3xl rounded-[48px] border border-white/10 flex items-center justify-center shadow-3xl">
                                <Activity className="w-12 h-12 text-white/50 animate-pulse" />
                            </div>

                            {/* Floating Spectral Particles (CSS only) */}
                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-pink-500 rounded-full blur-sm animate-ping"></div>
                            <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-ping delay-700"></div>
                        </div>

                        <div className="text-center space-y-6">
                            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em] text-white">Synthesizing Essence</h3>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-pink-500"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Decrypting Vocal Fractals</span>
                                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-pink-500"></div>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <AnalysisResult analysis={result} />
                    </div>
                )}
            </div>
        </div>
    )
}
