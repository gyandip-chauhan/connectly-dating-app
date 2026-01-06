// types/database.ts

export interface UserProfile {
  user_id: string
  display_name: string
  bio?: string | null
  age?: number | null
  gender?: string | null
  preferred_gender?: string | null
  location?: string | null
  profile_picture_url?: string | null
  interests?: string[] | null
  onboarding_completed?: boolean | null
  created_at: string
  updated_at: string
  city?: string | null
  country?: string | null
  dietary_preferences?: string | null
  drinking_habits?: string | null
  education?: string | null
  email?: string | null
  exercise_habits?: string | null
  full_name?: string | null
  height_cm?: string | null
  interested_in?: string[] | null
  lifestyle?: string[] | null
  love_language?: string | null
  occupation?: string | null
  perfect_first_date?: string | null // Schema says date, but UI treats as text description. Using string.
  personality_traits?: string[] | null
  relationship_goals?: string | null
  religion?: string | null
  smoking_habits?: string | null
  typical_weekend?: string | null
  zodiac_sign?: string | null
  is_premium?: boolean | null
  is_verified?: boolean | null
}

export interface AudioAnalysis {
  id: string
  user_id: string
  audio_url: string
  transcription?: string | null
  emotional_tones?: any | null // jsonb
  fluency_score?: number | null
  analyzed_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  sent_at: string
  is_read?: boolean | null
  moderation_status?: string | null
  moderation_flags?: string[] | null
  moderation_score?: number | null
}

export interface ChatRoom {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  last_message_at?: string | null
}

export interface CompatibilityScore {
  id: string
  user1_id: string
  user2_id: string
  overall_score: number
  emotional_compatibility: number
  interest_compatibility: number
  trait_compatibility: number
  calculated_at: string
}

export interface EmotionalBadge {
  id: string
  user_id: string
  badge_type: string
  badge_value: number
  awarded_at: string
  context?: string | null
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  created_at: string
  ai_analysis?: any | null // jsonb
  sentiment_score?: number | null
}

export interface Swipe {
  id: string
  swiper_id: string
  swiped_id: string
  swipe_type: 'like' | 'dislike' | 'super_like'
  created_at: string
}

export interface TraitScore {
  id: string
  user_id: string
  openness?: number | null
  conscientiousness?: number | null
  extraversion?: number | null
  agreeableness?: number | null
  neuroticism?: number | null
  emotional_fluency?: number | null
  positive_tone?: number | null
  negative_tone?: number | null
  analysis_date: string
}

export interface User {
  id: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
  last_active_at?: string | null
  is_verified?: boolean | null
  verification_token?: string | null
  reset_token?: string | null
  reset_token_expires_at?: string | null
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  show_online_status: boolean
  show_distance: boolean
  language: string
  theme: string
  created_at: string
  updated_at: string
}

