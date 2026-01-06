// components/matches/ChatInterface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom, UserProfile, ChatMessage } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { Send, Image, Mic } from 'lucide-react'

interface ChatInterfaceProps {
  match: ChatRoom
  otherUserProfile: UserProfile
  onBack?: () => void
}

export default function ChatInterface({ match, otherUserProfile, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (match) {
      setMessages([])
      setLoading(true)
      fetchMessages()
      const cleanup = setupRealtimeSubscription()
      return cleanup
    }
    return undefined
  }, [match.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', match.id)
        .order('sent_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    console.log('Setting up realtime for match:', match.id)

    const subscription = supabase
      .channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages', // FIXED: was 'messages'
          filter: `room_id=eq.${match.id}`
        },
        (payload) => {
          console.log('Realtime message received:', payload.new)
          const incomingMessage = payload.new as ChatMessage

          setMessages(prev => {
            // Prevent duplicates from optimistic update
            const exists = prev.some(m =>
              m.id === incomingMessage.id ||
              (m.id.startsWith('temp-') && m.sender_id === incomingMessage.sender_id && m.content === incomingMessage.content)
            )

            if (exists) {
              // Replace temp with real message
              return prev.map(m =>
                (m.id.startsWith('temp-') && m.sender_id === incomingMessage.sender_id && m.content === incomingMessage.content)
                  ? incomingMessage
                  : m
              )
            }

            return [...prev, incomingMessage]
          })

          markMessageAsRead(incomingMessage)
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      subscription.unsubscribe()
    }
  }

  const markMessageAsRead = async (message: ChatMessage) => {
    if (message.sender_id !== user?.id && !message.is_read) {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', message.id)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`

    // Clear input and set sending state immediately
    setNewMessage('')
    setSending(true)

    // Create optimistic message for INSTANT display
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: match.id,
      sender_id: user.id,
      content: messageContent,
      sent_at: new Date().toISOString(),
      is_read: false
    }

    // ADD MESSAGE TO STATE IMMEDIATELY - This is the key fix!
    setMessages(prevMessages => [...prevMessages, optimisticMessage])

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: match.id,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId))
        return
      }

      // Replace temp message with real message from database
      if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m))
      }

      // Update chat room last message timestamp
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', match.id)

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 glass-card flex items-center justify-center p-8 overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-pink-500 animate-spin"></div>
          <p className="text-white/40 text-sm font-medium animate-pulse">Loading connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">
      {/* Immersive Background Depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[140px] rounded-full animate-float"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full animate-float" style={{ animationDelay: '-4s' }}></div>
      </div>

      {/* Premium Chat Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-[#0c0a1f]/60 backdrop-blur-3xl relative z-30">
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          {/* Mobile Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2.5 -ml-2 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all active:scale-90 border border-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Avatar Section */}
          <div className="relative flex-shrink-0 group">
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-[22px] p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-xl">
              <div className="w-full h-full rounded-[20px] overflow-hidden border-[3px] border-[#0c0a1f] bg-[#0c0a1f]">
                {otherUserProfile?.profile_picture_url ? (
                  <img
                    src={otherUserProfile.profile_picture_url}
                    alt={otherUserProfile.display_name || 'User'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <span className="text-white font-black text-xl">
                      {(otherUserProfile?.display_name || 'U')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-[3.5px] border-[#0c0a1f] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          </div>

          {/* Name & Status Section */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-xl md:text-3xl font-black text-white tracking-[-0.04em] truncate leading-none">
                {otherUserProfile?.display_name || 'Soul Connection'}
              </h3>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-white/30 truncate">
                Resonating in {otherUserProfile?.city || 'the area'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-3 ml-4">
          <button title="Voice Call" className="p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/30 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button title="Video Call" className="p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/30 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <div className="w-[1px] h-8 bg-white/5 mx-1 hidden md:block"></div>
          <button className="hidden md:flex p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/30 hover:text-white transition-all duration-300">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Flow Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar z-10 relative">
        <div className="max-w-5xl mx-auto space-y-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center animate-in fade-in duration-1000">
              <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-pink-500/10 blur-[60px] rounded-full animate-pulse group-hover:bg-pink-500/20 transition-all duration-700"></div>
                <div className="relative w-28 h-28 bg-white/[0.02] border border-white/5 rounded-[48px] flex items-center justify-center shadow-3xl">
                  <span className="text-4xl opacity-20 group-hover:opacity-60 transition-opacity duration-700">💭</span>
                </div>
              </div>
              <h4 className="text-2xl font-black text-white tracking-tighter mb-4 leading-tight uppercase">Connection Initiated</h4>
              <p className="text-white/20 text-lg max-w-sm leading-relaxed font-bold tracking-tight px-4">
                Manifest a deeper resonance. Say something meaningful to <span className="text-pink-500/60">{otherUserProfile?.display_name}</span>.
              </p>
            </div>
          ) : (
            messages.map((message, idx) => {
              const isMe = message.sender_id === user?.id
              const showTime = idx === 0 ||
                new Date(message.sent_at).getTime() - new Date(messages[idx - 1].sent_at).getTime() > 300000;

              return (
                <div key={message.id} className="space-y-4">
                  {showTime && (
                    <div className="flex justify-center my-12 animate-in fade-in duration-700">
                      <span className="px-5 py-2 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/15">
                        {new Date(message.sent_at).toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-4 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}
                  >
                    {/* {!isMe && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 mb-2">
                        <img src={otherUserProfile?.profile_picture_url || '/placeholder-user.png'} alt="" className="w-full h-full object-cover" />
                      </div>
                    )} */}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%] gap-2`}>
                      <div
                        className={`relative px-6 py-4 rounded-[28px] text-sm md:text-md leading-relaxed group transition-all duration-500 ${isMe
                          ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 text-white rounded-br-none shadow-2xl shadow-pink-500/20'
                          : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-bl-none backdrop-blur-3xl shadow-xl'
                          }`}
                      >
                        {/* High-fidelity inner glow for messages */}
                        <div className="absolute inset-x-4 top-0 h-[1px] bg-white/20 blur-[0.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <p className="whitespace-pre-wrap font-bold tracking-tight">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/10">
                          {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && message.is_read && (
                          <div className="w-3 h-3 text-cyan-400 opacity-40">
                            <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Crystalline Island Input Area */}
      <footer className="flex-shrink-0 p-8 md:p-12 relative z-30">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Soft Ambient Shadow for Input */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-600/10 to-blue-600/10 blur-[40px] rounded-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>

            <div className="relative flex items-end gap-3 md:gap-5">
              <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden focus-within:border-white/20 focus-within:bg-white/[0.04] transition-all duration-700 shadow-3xl backdrop-blur-2xl">
                <div className="flex items-center px-4 py-2 border-b border-white/[0.03] space-x-1">
                  <button className="p-2.5 text-white/15 hover:text-white/60 transition-colors hover:bg-white/5 rounded-xl">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 text-white/15 hover:text-white/60 transition-colors hover:bg-white/5 rounded-xl">
                    <Mic className="w-4 h-4" />
                  </button>
                  <div className="flex-1"></div>
                  <div className="h-4 w-[1px] bg-white/5 mx-2"></div>
                  <button className="p-2.5 text-white/15 hover:text-white/60 rounded-xl hover:bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest">Type...</span>
                  </button>
                </div>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Speak your truth to ${otherUserProfile?.display_name}...`}
                  rows={1}
                  className="w-full bg-transparent py-5 px-8 text-md text-white placeholder-white/10 focus:outline-none resize-none max-h-48 custom-scrollbar font-bold tracking-tight"
                  style={{ minHeight: '64px' }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-16 h-16 flex-shrink-0 rounded-[28px] bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 text-white shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-90 disabled:opacity-20 disabled:grayscale transition-all duration-500 flex items-center justify-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Send className={`w-6 h-6 transition-transform duration-500 ${newMessage.trim() && !sending ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 animate-in fade-in duration-1000">
            <div className="h-[1px] w-8 bg-white/5"></div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 pointer-events-none">
              Resonance Channel Encrypted
            </p>
            <div className="h-[1px] w-8 bg-white/5"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}
