'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/database'
import { Camera, MapPin, BookOpen, Heart, GraduationCap, Ruler, Activity, Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    display_name: '',
    full_name: '',
    age: 18,
    gender: '',
    interested_in: [],
    bio: '',
    occupation: '',
    education: '',
    height_cm: undefined,
    relationship_goals: '',
    personality_traits: [],
    interests: [],
    lifestyle: [],
    city: '',
    country: '',
    drinking_habits: '',
    smoking_habits: '',
    exercise_habits: '',
    dietary_preferences: '',
    religion: '',
    zodiac_sign: '',
    love_language: '',
    typical_weekend: '',
    perfect_first_date: ''
  })
  const router = useRouter()
  const supabase = createClient()

  // Guard the page: require auth and skip if profile already exists.
  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        const user = session?.user
        if (!user) {
          router.replace('/auth')
          return
        }

        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) throw profileError
        if (existingProfile) {
          router.replace('/discover')
          return
        }
      } catch (err) {
        console.error('Error preparing profile setup:', err)
        setErrorMessage('Unable to load profile setup. Please try signing in again.')
      } finally {
        setBootstrapping(false)
      }
    }

    hydrate()
  }, [router, supabase])

  const updateProfileField = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const updateArrayField = (field: string, value: string, checked: boolean) => {
    const currentArray = (profile[field as keyof UserProfile] as string[]) || []
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    updateProfileField(field, newArray)
  }

  const handleSubmit = async () => {
    setErrorMessage('')
    setLoading(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const user = session?.user
      if (!user) throw new Error('No authenticated user. Please sign in again.')

      const cleanString = (val?: string | null) => (val && val.trim().length ? val.trim() : null)
      const arr = (val?: string[]) => (val && val.length ? val.filter(Boolean) : [])

      const payload: Partial<UserProfile> = {
        user_id: user.id,
        email: user.email ?? '',
        display_name: cleanString(profile.display_name) || '',
        full_name: cleanString(profile.full_name),
        age: profile.age ?? null,
        gender: cleanString(profile.gender),
        interested_in: arr(profile.interested_in as string[]),
        bio: cleanString(profile.bio),
        occupation: cleanString(profile.occupation),
        education: cleanString(profile.education),
        height_cm: profile.height_cm ? String(profile.height_cm) : null,
        relationship_goals: cleanString(profile.relationship_goals),
        personality_traits: arr(profile.personality_traits as string[]),
        interests: arr(profile.interests as string[]),
        lifestyle: arr(profile.lifestyle as string[]),
        city: cleanString(profile.city),
        country: cleanString(profile.country),
        drinking_habits: cleanString(profile.drinking_habits),
        smoking_habits: cleanString(profile.smoking_habits),
        exercise_habits: cleanString(profile.exercise_habits),
        dietary_preferences: cleanString(profile.dietary_preferences),
        religion: cleanString(profile.religion),
        zodiac_sign: cleanString(profile.zodiac_sign),
        love_language: cleanString(profile.love_language),
        typical_weekend: cleanString(profile.typical_weekend),
        perfect_first_date: profile.perfect_first_date || null,
        onboarding_completed: true,
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error

      router.push('/discover')
    } catch (error) {
      console.error('Error creating profile:', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in (error as any)
            ? String((error as any).message)
            : 'Error creating profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'About You' },
    { number: 3, title: 'Interests' },
    { number: 4, title: 'Personality' }
  ]

  const interests = [
    'Travel', 'Music', 'Art', 'Sports', 'Reading', 'Cooking', 'Hiking',
    'Photography', 'Dancing', 'Movies', 'Gaming', 'Technology', 'Fitness',
    'Yoga', 'Animals', 'Nature', 'Food', 'Wine', 'Coffee', 'Volunteering',
    'Writing', 'Meditation', 'Shopping', 'Theater', 'Science', 'History'
  ]

  const lifestyles = [
    'Active', 'Adventurous', 'Homebody', 'Social', 'Minimalist', 'Luxury',
    'Health Conscious', 'Creative', 'Intellectual', 'Spiritual', 'Outdoorsy',
    'Foodie', 'Night Owl', 'Early Bird', 'Traveler', 'Bookworm'
  ]

  const personalityTraits = [
    'Adventurous', 'Ambitious', 'Analytical', 'Artistic', 'Caring', 'Confident',
    'Creative', 'Curious', 'Empathetic', 'Energetic', 'Funny', 'Generous',
    'Honest', 'Independent', 'Intellectual', 'Optimistic', 'Organized', 'Passionate',
    'Patient', 'Romantic', 'Spontaneous', 'Thoughtful'
  ]

  const loveLanguages = [
    'Words of Affirmation',
    'Acts of Service',
    'Receiving Gifts',
    'Quality Time',
    'Physical Touch'
  ]

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-brand-primary animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="page-shell max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-xl text-3xl md:text-5xl mb-3">Create Your <span className="text-gradient">Profile</span></h1>
          <p className="body-lg text-base md:text-lg">Tell us about yourself to find better matches.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 px-4">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
            {steps.map((stepItem, index) => {
              const isActive = step >= stepItem.number
              const isCurrent = step === stepItem.number
              return (
                <div key={stepItem.number} className="flex flex-col items-center gap-2 bg-[#0f0c29] px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/20 bg-[#0f0c29] text-white/40'}`}>
                    {isActive ? <Check className="w-5 h-5" /> : stepItem.number}
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-semibold transition-colors duration-300 ${isCurrent ? 'text-brand-primary' : 'text-white/40'}`}>{stepItem.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="glass-card p-6 md:p-10 relative overflow-hidden">
          {/* Decorative Gradient Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary opacity-50"></div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 backdrop-blur-md">
              {errorMessage}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 profile-form animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative w-full h-full bg-white/5 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden hover:border-brand-primary hover:bg-white/10 transition-all">
                    <Camera className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <p className="text-sm text-white/60">Tap to upload a photo</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Display Name *</label>
                  <input
                    type="text"
                    required
                    value={profile.display_name}
                    onChange={(e) => updateProfileField('display_name', e.target.value)}
                    placeholder="How should we call you?"
                  />
                </div>
                <div>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => updateProfileField('full_name', e.target.value)}
                    placeholder="Your full name (private)"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Age *</label>
                  <input
                    type="number"
                    required
                    value={profile.age}
                    onChange={(e) => updateProfileField('age', parseInt(e.target.value))}
                    min="18"
                    max="100"
                  />
                </div>
                <div>
                  <label>Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="number"
                      value={profile.height_cm || ''}
                      onChange={(e) => updateProfileField('height_cm', parseInt(e.target.value))}
                      className="pl-12"
                      placeholder="Height in cm"
                      min="100"
                      max="250"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>I identify as *</label>
                  <select
                    required
                    value={profile.gender}
                    onChange={(e) => updateProfileField('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Interested in dating *</label>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {['Male', 'Female', 'Non-binary', 'Other'].map((gender) => (
                      <label key={gender} className={`cursor-pointer px-4 py-2 rounded-xl text-sm border transition-all ${(profile.interested_in || []).includes(gender)
                          ? 'bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_10px_rgba(255,46,99,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={(profile.interested_in || []).includes(gender)}
                          onChange={(e) => updateArrayField('interested_in', gender, e.target.checked)}
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={profile.city}
                      onChange={(e) => updateProfileField('city', e.target.value)}
                      className="pl-12"
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div>
                  <label>Country</label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => updateProfileField('country', e.target.value)}
                    placeholder="Your country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6 profile-form animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Occupation</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.occupation}
                      onChange={(e) => updateProfileField('occupation', e.target.value)}
                      className="pl-12"
                      placeholder="What do you do?"
                    />
                  </div>
                </div>

                <div>
                  <label>Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.education}
                      onChange={(e) => updateProfileField('education', e.target.value)}
                      className="pl-12"
                      placeholder="Your education"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label>Bio *</label>
                <textarea
                  required
                  value={profile.bio}
                  onChange={(e) => updateProfileField('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself, your passions, and what makes you unique..."
                />
              </div>

              <div>
                <label>Relationship Goals *</label>
                <div className="relative">
                  <Heart className="absolute left-4 top-4 text-white/40 w-5 h-5" />
                  <select
                    required
                    value={profile.relationship_goals}
                    onChange={(e) => updateProfileField('relationship_goals', e.target.value)}
                    className="pl-12"
                  >
                    <option value="">What are you looking for?</option>
                    <option value="Long-term relationship">Long-term relationship</option>
                    <option value="Casual dating">Casual dating</option>
                    <option value="Friendship">New friends</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests & Lifestyle */}
          {step === 3 && (
            <div className="space-y-8 profile-form animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="mb-4">What are you interested in? *</label>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {interests.map((interest) => (
                    <label key={interest} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all ${(profile.interests || []).includes(interest)
                        ? 'bg-brand-secondary/20 border-brand-secondary text-brand-secondary shadow-[0_0_10px_rgba(8,217,214,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={(profile.interests || []).includes(interest)}
                        onChange={(e) => updateArrayField('interests', interest, e.target.checked)}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-4">Which describe your lifestyle? *</label>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {lifestyles.map((lifestyle) => (
                    <label key={lifestyle} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all ${(profile.lifestyle || []).includes(lifestyle)
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={(profile.lifestyle || []).includes(lifestyle)}
                        onChange={(e) => updateArrayField('lifestyle', lifestyle, e.target.checked)}
                      />
                      {lifestyle}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Drinking Habits</label>
                  <select
                    value={profile.drinking_habits}
                    onChange={(e) => updateProfileField('drinking_habits', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Never">Never</option>
                    <option value="Socially">Socially</option>
                    <option value="Regularly">Regularly</option>
                  </select>
                </div>
                <div>
                  <label>Smoking Habits</label>
                  <select
                    value={profile.smoking_habits}
                    onChange={(e) => updateProfileField('smoking_habits', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Never">Never</option>
                    <option value="Socially">Socially</option>
                    <option value="Regularly">Regularly</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Exercise Habits</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                    <select
                      value={profile.exercise_habits}
                      onChange={(e) => updateProfileField('exercise_habits', e.target.value)}
                      className="pl-12"
                    >
                      <option value="">Select</option>
                      <option value="Never">Never</option>
                      <option value="Occasionally">Occasionally</option>
                      <option value="Regularly">Regularly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>Dietary Preferences</label>
                  <select
                    value={profile.dietary_preferences}
                    onChange={(e) => updateProfileField('dietary_preferences', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Omnivore">Omnivore</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                    <option value="Keto">Keto</option>
                    <option value="Gluten-free">Gluten-free</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Personality & Preferences */}
          {step === 4 && (
            <div className="space-y-6 profile-form animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="mb-4">Which personality traits describe you? *</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {personalityTraits.map((trait) => (
                    <label key={trait} className={`cursor-pointer px-4 py-2 rounded-full text-sm border transition-all ${(profile.personality_traits || []).includes(trait)
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={(profile.personality_traits || []).includes(trait)}
                        onChange={(e) => updateArrayField('personality_traits', trait, e.target.checked)}
                      />
                      {trait}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Love Language</label>
                  <select
                    value={profile.love_language}
                    onChange={(e) => updateProfileField('love_language', e.target.value)}
                  >
                    <option value="">Select your love language</option>
                    {loveLanguages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Zodiac Sign</label>
                  <select
                    value={profile.zodiac_sign}
                    onChange={(e) => updateProfileField('zodiac_sign', e.target.value)}
                  >
                    <option value="">Select your sign</option>
                    {zodiacSigns.map(sign => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Religion</label>
                  <select
                    value={profile.religion}
                    onChange={(e) => updateProfileField('religion', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Agnostic">Agnostic</option>
                    <option value="Atheist">Atheist</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Christian">Christian</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Jewish">Jewish</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Describe your typical weekend</label>
                <textarea
                  value={profile.typical_weekend}
                  onChange={(e) => updateProfileField('typical_weekend', e.target.value)}
                  rows={3}
                  placeholder="What do you usually do on weekends?"
                />
              </div>

              <div>
                <label>Your perfect first date</label>
                <textarea
                  value={profile.perfect_first_date}
                  onChange={(e) => updateProfileField('perfect_first_date', e.target.value)}
                  rows={3}
                  placeholder="Describe your ideal first date..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 border-t border-white/10 pt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-ghost"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                Continue <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Profile <Sparkles className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
