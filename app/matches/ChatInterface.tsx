'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Match, UserProfile, Message } from '@/types/database'
import { useAuth } from '@/components/providers/AuthProvider'
import { Send, Image, Mic, MoreVertical } from 'lucide-react'

interface ChatInterfaceProps {
  match: Match
  otherUserProfile: UserProfile
}

export default function ChatInterface({ match, otherUserProfile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (match) {
      fetchMessages()
      setupRealtimeSubscription()
    }
  }, [match])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${match.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
          markMessageAsRead(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const markMessageAsRead = async (message: Message) => {
    if (message.sender_id !== user?.id && !message.is_read) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', message.id)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: match.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      // Update match last message timestamp
      await supabase
        .from('matches')
        .update({ 
          last_message_at: new Date().toISOString(),
          last_interaction: new Date().toISOString()
        })
        .eq('id', match.id)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
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
      <div className="bg-white rounded-2xl shadow-sm p-8 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
            {otherUserProfile?.profile_photos?.[0] && (
              <img
                src={otherUserProfile.profile_photos[0]}
                alt={otherUserProfile.display_name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {otherUserProfile?.display_name}
            </h3>
            <p className="text-sm text-gray-500">
              {otherUserProfile?.age} • {otherUserProfile?.city}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender_id === user?.id
                  ? 'bg-pink-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === user?.id ? 'text-pink-100' : 'text-gray-500'
              }`}>
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-pink-500 transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-pink-500 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
