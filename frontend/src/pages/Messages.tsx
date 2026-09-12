import { useEffect, useState } from 'react'
import { Search, Send, User } from 'lucide-react'
import api from '../api/client'
import { SkeletonLine } from '../components/ui/Skeleton'

export function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeThread, setActiveThread] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages')
      setConversations(res.data.data)
      if (res.data.data.length > 0) setActiveThread(res.data.data[0].id)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <div className="p-8 text-center text-slate-500">No messages.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map(conv => (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveThread(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors ${activeThread === conv.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 truncate pr-2">{conv.subject}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <User className="w-3 h-3" />
                    <span>{conv.patient ? `${conv.patient.firstName} ${conv.patient.lastName}` : 'System'}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{conv.messages?.[0]?.body || 'No messages'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-white">
        {activeThread ? (
          <>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 text-lg">Conversation details</h3>
              <p className="text-sm text-slate-500 mt-1">Select a patient or staff member to view full details.</p>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              <div className="text-center text-sm text-slate-400 my-4">Today</div>
              {/* Message bubbles would go here */}
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-2 max-w-md shadow-sm">
                  Please review the attached EOB for patient John Doe.
                  <div className="text-[10px] text-slate-400 mt-1 text-right">9:41 AM</div>
                </div>
              </div>
              <div className="flex justify-end mb-4">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-md shadow-sm">
                  I will check it right now. Thanks!
                  <div className="text-[10px] text-blue-200 mt-1 text-right">9:45 AM</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                  <Send className="w-5 h-5" />
                </button>
              </div>
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
