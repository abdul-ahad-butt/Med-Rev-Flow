import { useEffect, useState, useRef } from 'react'
import { Search, Send, User, Mail } from 'lucide-react'
import api from '../api/client'
import { SkeletonLine } from '../components/ui/Skeleton'
import { useAuthStore } from '../store/auth.store'

export function MessagesPage() {
  const { user, token } = useAuthStore()
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const ws = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread)
      setupWebSocket(activeThread)
    } else {
      setMessages([])
    }
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [activeThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations')
      const convs = Array.isArray(res.data?.data) ? res.data.data : []
      setConversations(convs)
      if (convs.length > 0 && !activeThread) setActiveThread(convs[0].id)
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (threadId: string) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/messages/conversations/${threadId}/messages`)
      setMessages(Array.isArray(res.data?.data) ? res.data.data : [])
      
      // Mark as read
      await api.post(`/messages/conversations/${threadId}/read`)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const setupWebSocket = (threadId: string) => {
    if (ws.current) {
      ws.current.close()
    }
    
    // Construct WS URL
    const isProd = window.location.protocol === 'https:'
    const wsProtocol = isProd ? 'wss:' : 'ws:'
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const wsUrl = apiUrl.replace(/^https?:/, wsProtocol) + `/api/messages/conversations/${threadId}/ws`
    
    // We can't send headers via browser WebSocket API natively without trickery, 
    // but the DO endpoint is under Hono which expects an auth header or cookie.
    // However, the worker can check tokens in query params if we supported it. 
    // But our authenticate middleware only looks at headers right now.
    // Wait, let's append token as a query param so the middleware can pick it up if we adapt it.
    // For now, let's just use the standard WebSocket. If it fails due to auth, we need to adapt auth middleware.
    const socket = new WebSocket(`${wsUrl}?token=${token}`)
    
    socket.onopen = () => {
      console.log('WebSocket connected')
    }
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          setMessages(prev => [...prev, data.payload])
          // If we receive a message while open, mark it as read immediately
          api.post(`/messages/conversations/${threadId}/read`).catch(console.error)
        }
      } catch (err) {
        console.error('Invalid WS message', err)
      }
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
    }

    ws.current = socket
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeThread) return

    const text = inputText
    setInputText('')

    try {
      const res = await api.post(`/messages/conversations/${activeThread}/messages`, { body: text })
      const newMsg = res.data.data
      setMessages(prev => [...prev, newMsg])
      
      // Broadcast via WS
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'message', payload: newMsg }))
      }
      
      // Update conversation list lastMessageAt locally
      setConversations(prev => {
        const copy = [...prev]
        const idx = copy.findIndex(c => c.id === activeThread)
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], lastMessageAt: newMsg.createdAt }
          copy.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        }
        return copy
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getOtherParticipant = (conv: any) => {
    if (!conv) return null
    return conv.participantAId === user?.id ? conv.participantB : conv.participantA
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <SkeletonLine className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2"><SkeletonLine className="w-2/3" /><SkeletonLine className="w-full" /></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No conversations.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map(conv => {
                const otherUser = getOtherParticipant(conv)
                const name = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'System'
                
                return (
                  <div 
                    key={conv.id} 
                    onClick={() => setActiveThread(conv.id)}
                    className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors ${activeThread === conv.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-800 truncate pr-2">{name}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : 'New'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <User className="w-3 h-3" />
                      <span className="uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{otherUser?.role.replace('_', ' ') || 'SYSTEM'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-white relative">
        {activeThread ? (
          <>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 text-lg">
                {(() => {
                  const conv = conversations.find(c => c.id === activeThread)
                  const other = getOtherParticipant(conv)
                  return other ? `${other.firstName} ${other.lastName}` : 'Conversation'
                })()}
              </h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">Say hello!</div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId === user?.id
                  return (
                    <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'} rounded-2xl px-4 py-2 max-w-md shadow-sm`}>
                        {msg.body}
                        <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button type="submit" disabled={!inputText.trim()} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Mail className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to read</p>
          </div>
        )}
      </div>
    </div>
  )
}
