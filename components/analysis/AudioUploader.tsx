import { UploadCloud, Mic } from 'lucide-react'
import { useState } from 'react'

interface AudioUploaderProps {
    onUpload: (file: File) => void
}

export default function AudioUploader({ onUpload }: AudioUploaderProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0])
        }
    }

    return (
        <div
            className={`relative w-full min-h-[420px] rounded-[48px] flex flex-col items-center justify-center transition-all duration-1000 border border-dashed overflow-hidden group/uploader ${dragActive
                ? 'border-pink-500/50 bg-pink-500/5 scale-[0.99]'
                : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            {/* Dynamic Aura Glows */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-pink-500/[0.03] blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover/uploader:bg-pink-500/[0.07] transition-all duration-1000"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/[0.03] blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none group-hover/uploader:bg-cyan-500/[0.07] transition-all duration-1000"></div>

            <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />

            <div className="flex flex-col items-center space-y-10 pointer-events-none relative z-20 transition-all duration-700 group-hover/uploader:scale-[1.02]">
                <div className="relative">
                    {/* Glowing Core */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 blur-[40px] opacity-10 group-hover/uploader:opacity-30 transition-opacity animate-pulse"></div>

                    <div className="w-28 h-28 rounded-[36px] bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-3xl relative overflow-hidden group/icon">
                        <Mic className="w-12 h-12 text-white opacity-40 group-hover/uploader:opacity-100 group-hover/uploader:text-pink-500 transition-all duration-700" />

                        {/* Internal scanning effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent h-1/2 -translate-y-full group-hover/uploader:animate-scan duration-[2s]"></div>
                    </div>

                    {/* Orbital Ring System */}
                    <div className="absolute inset-[-12px] border border-white/5 rounded-[44px] animate-spin-slow opacity-20"></div>
                    <div className="absolute inset-[-24px] border border-white/5 rounded-[52px] animate-spin-slow-reverse opacity-10" style={{ animationDuration: '12s' }}></div>
                </div>

                <div className="text-center space-y-4">
                    <h3 className="text-3xl font-black italic tracking-[-0.04em] text-white">
                        Imprint your <span className="text-white/20">Resonance</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 group-hover/uploader:text-white/40 transition-colors">
                        Drop spectral data or click to explore
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-full transition-all group-hover/uploader:border-white/20 group-hover/uploader:text-white/60">
                        <UploadCloud className="w-4 h-4 text-cyan-400" />
                        <span>FLAC / MP3 / WAV</span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
                        Limit 20MB
                    </div>
                </div>
            </div>

            {/* Neural Scanning Beam */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover/uploader:opacity-100 group-hover/uploader:animate-scan-line pointer-events-none"></div>
        </div>
    )
}
