'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom, UserProfile, ChatMessage } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { Send, Image, Mic } from 'lucide-react'

interface ChatWindowProps {
    room: ChatRoom
    otherUserProfile: UserProfile
}

export default function ChatWindow({ room, otherUserProfile }: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { user } = useAuth()
    const supabase = createClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (room) {
            setMessages([]) // Clear messages when room changes
            setLoading(true)
            fetchMessages()
            const cleanup = setupRealtimeSubscription()
            return cleanup
        }
    }, [room.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', room.id)
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
        console.log('Setting up realtime subscription for room:', room.id)

        const subscription = supabase
            .channel(`room-${room.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${room.id}`
                },
                (payload) => {
                    console.log('Realtime message received:', payload.new)
                    const incomingMessage = payload.new as ChatMessage

                    setMessages(prev => {
                        // Check if message already exists (avoid duplicates from optimistic update)
                        const exists = prev.some(m =>
                            m.id === incomingMessage.id ||
                            (m.id.startsWith('temp-') && m.sender_id === incomingMessage.sender_id && m.content === incomingMessage.content)
                        )

                        if (exists) {
                            // Replace temp message with real one
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

        // Clear input immediately
        setNewMessage('')
        setSending(true)

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
            id: tempId,
            room_id: room.id,
            sender_id: user.id,
            content: messageContent,
            sent_at: new Date().toISOString(),
            is_read: false
        }

        // Add to state immediately
        setMessages(prevMessages => [...prevMessages, optimisticMessage])

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    room_id: room.id,
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

            // Replace temp message with real message
            if (data) {
                setMessages(prev => prev.map(m => m.id === tempId ? data : m))
            }

            // Update chat room timestamp
            await supabase
                .from('chat_rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', room.id)

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
            <div className="flex-1 flex items-center justify-center bg-[#0c0a1f]/10 backdrop-blur-3xl">
                <div className="h-12 w-12 rounded-full border-4 border-white/5 border-t-pink-500 animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 md:p-8 border-b border-white/10 bg-[#0c0a1f]/40 backdrop-blur-3xl relative z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
                            <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-[#0c0a1f] bg-[#0c0a1f]">
                                {otherUserProfile?.profile_picture_url ? (
                                    <img
                                        src={otherUserProfile.profile_picture_url}
                                        alt={otherUserProfile.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <span className="text-white font-black text-xl">{otherUserProfile?.display_name?.[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-[#0c0a1f] rounded-full"></div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-2xl font-black text-white tracking-tighter truncate">
                            {otherUserProfile?.display_name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                Active in {otherUserProfile?.city || 'the area'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-10 pb-10 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                <div className="pt-10"> {/* Initial padding for first messages */}
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-20 h-20 bg-white/[0.03] rounded-[32px] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                                <span className="text-3xl opacity-20 grayscale">💬</span>
                            </div>
                            <h4 className="text-xl font-black text-white tracking-tighter mb-2">Soulful Connection</h4>
                            <p className="text-white/30 text-sm max-w-xs text-center leading-relaxed">
                                Every deep bond begins with a single word. Say hello to {otherUserProfile?.display_name}!
                            </p>
                        </div>
                    ) : (
                        messages.map((message, idx) => {
                            const isMe = message.sender_id === user?.id
                            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== message.sender_id

                            return (
                                <div
                                    key={message.id}
                                    className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                                >
                                    {!isMe && (
                                        <div className={`w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 mb-1 transition-opacity duration-300 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                            <img
                                                src={otherUserProfile.profile_picture_url || ''}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] gap-1`}>
                                        <div
                                            className={`px-5 py-3 rounded-[24px] text-sm leading-relaxed shadow-xl ${isMe
                                                ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-none shadow-pink-500/10'
                                                : 'bg-white/[0.04] text-white/90 rounded-bl-none border border-white/10 backdrop-blur-md shadow-black/20'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 px-2">
                                            {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input Area */}
            <div className="flex-shrink-0 p-6 md:p-8 bg-transparent relative z-20">
                <div className="max-w-4xl mx-auto flex items-end gap-4">
                    <div className="flex-1 glass-card !bg-white/[0.03] !border-white/10 !rounded-[28px] overflow-hidden focus-within:!border-pink-500/30 transition-all shadow-2xl">
                        <div className="flex items-center px-4 pt-1 border-b border-white/5">
                            <button className="p-2 text-white/20 hover:text-white transition-colors">
                                <Image className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-white/20 hover:text-white transition-colors">
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${otherUserProfile?.display_name}...`}
                            rows={1}
                            className="w-full bg-transparent py-4 px-6 text-sm text-white placeholder-white/20 focus:outline-none resize-none max-h-32 custom-scrollbar"
                            style={{ minHeight: '56px' }}
                        />
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="w-14 h-14 flex-shrink-0 rounded-[22px] bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-xl shadow-pink-500/20 hover:brightness-110 active:scale-90 disabled:opacity-40 disabled:grayscale transition-all flex items-center justify-center group"
                    >
                        <Send className={`w-5 h-5 transition-transform ${newMessage.trim() && !sending ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''}`} />
                    </button>
                </div>
                <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mt-6 pointer-events-none">
                    Encrypted & Secure Conversations
                </p>
            </div>
        </div>
    )
}
