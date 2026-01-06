// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`
  }
  return `${(distanceInMeters / 1000).toFixed(1)}km`
}

export function formatLastOnline(lastOnline: string): string {
  const now = new Date()
  const lastOnlineDate = new Date(lastOnline)
  const diffInMinutes = Math.floor((now.getTime() - lastOnlineDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

export function calculateCompatibility(profile1: any, profile2: any): number {
  let score = 0
  let totalPossible = 0

  // Interest matching (40%)
  if (profile1.interests && profile2.interests) {
    const commonInterests = profile1.interests.filter((interest: string) => 
      profile2.interests.includes(interest)
    )
    score += (commonInterests.length / Math.max(profile1.interests.length, profile2.interests.length)) * 40
  }
  totalPossible += 40

  // Lifestyle matching (30%)
  if (profile1.lifestyle && profile2.lifestyle) {
    const commonLifestyle = profile1.lifestyle.filter((item: string) => 
      profile2.lifestyle.includes(item)
    )
    score += (commonLifestyle.length / Math.max(profile1.lifestyle.length, profile2.lifestyle.length)) * 30
  }
  totalPossible += 30

  // Relationship goals matching (20%)
  if (profile1.relationship_goals && profile2.relationship_goals) {
    if (profile1.relationship_goals === profile2.relationship_goals) {
      score += 20
    } else {
      // Partial match for compatible goals
      const compatibleGoals = [
        ['Long-term relationship', 'Marriage'],
        ['Casual dating', 'Short-term relationship'],
        ['Friendship', 'New friends']
      ]
      
      const isCompatible = compatibleGoals.some(pair => 
        pair.includes(profile1.relationship_goals) && pair.includes(profile2.relationship_goals)
      )
      if (isCompatible) score += 10
    }
  }
  totalPossible += 20

  // Age compatibility (10%)
  if (profile1.age && profile2.age) {
    const ageDiff = Math.abs(profile1.age - profile2.age)
    if (ageDiff <= 5) score += 10
    else if (ageDiff <= 10) score += 5
  }
  totalPossible += 10

  return Math.round((score / totalPossible) * 100)
}

export function generateIcebreaker(commonInterests: string[]): string {
  const icebreakers = [
    "I noticed we both enjoy {interest}. What's your favorite thing about it?",
    "Hey! I see we're both into {interest}. Have you tried any new {interest} activities lately?",
    "It's great to meet someone who also loves {interest}! What got you into it?",
    "I'm excited to connect with another {interest} enthusiast! What's your most memorable {interest} experience?"
  ]
  
  if (commonInterests.length === 0) {
    return "Hi! I'd love to get to know you better. What are you passionate about?"
  }
  
  const randomIcebreaker = icebreakers[Math.floor(Math.random() * icebreakers.length)]
  const randomInterest = commonInterests[Math.floor(Math.random() * commonInterests.length)]
  
  return randomIcebreaker.replace(/{interest}/g, randomInterest.toLowerCase())
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
