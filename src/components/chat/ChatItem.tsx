import { useChatStore } from '../../store/chatStore'

import { type ChatPreview } from '../../types'

interface ChatItemProps {
  chat: ChatPreview
  isActive: boolean
  currentUserId: string | undefined
}

export const ChatItem = ({ chat, isActive, currentUserId }: ChatItemProps) => {
  const setActiveChat = useChatStore(state => state.setActiveChat)
  const isMyLastMessage = chat.lastMessage?.senderId === currentUserId
  
  const time = chat.lastMessage 
    ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div 
      onClick={() => setActiveChat(chat.chat_id, { title: chat.title, type: chat.type })}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800/50 text-slate-300'
      }`}
    >
      <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold border ${
        isActive ? 'bg-sky-500 border-sky-400' : 'bg-slate-700 border-slate-600 text-sky-400'
      }`}>
        {chat.title[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm font-semibold truncate">{chat.title}</span>
          <div className="flex items-center gap-1 shrink-0">
            {isMyLastMessage && (
              <svg className={`w-4 h-4 ${isActive ? 'text-sky-100' : 'text-sky-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 13l3 3 7-7" /><path d="M12 13l3 3 7-7" />
              </svg>
            )}
            <span className={`text-[11px] ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
              {time}
            </span>
          </div>
        </div>
        <div className={`text-[13px] truncate ${isActive ? 'text-sky-100/80' : 'text-slate-500'}`}>
          {chat.lastMessage?.content || 'Нет сообщений'}
        </div>
      </div>
    </div>
  )
}