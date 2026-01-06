'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload, X } from 'lucide-react'

interface PhotoUploadProps {
  onPhotoUploaded: (url: string) => void
}

export default function PhotoUpload({ onPhotoUploaded }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    uploadFiles(files)
  }

  const uploadFiles = async (files: FileList) => {
    try {
      setUploading(true)
      const file = files[0]

      // Basic validation
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 5MB.")
        setUploading(false)
        return
      }

      // Convert to Base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        onPhotoUploaded(base64String)
        setUploading(false)
      }
      reader.onerror = () => {
        console.error("Error reading file")
        setUploading(false)
      }
      reader.readAsDataURL(file)

    } catch (error) {
      console.error('Error processing photo:', error)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>Upload Profile Photo</span>
          </>
        )}
      </button>

      {/* Preview removed as parent updates main profile image */}
    </div>
  )
}
