import { useChatStore } from '../../store/chatStore'
import { useNavigate } from 'react-router-dom'

import { type ChatPreview } from '../../types'

interface ChatItemProps {
  chat: ChatPreview
  isActive: boolean
  currentUserId: string | undefined
}

export const ChatItem = ({ chat, isActive, currentUserId }: ChatItemProps) => {
  const setActiveChat = useChatStore(state => state.setActiveChat)
  const navigate = useNavigate()
  const isMyLastMessage = chat.lastMessage?.senderId === currentUserId
  
  const time = chat.lastMessage 
    ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div 
      onClick={() => {
        setActiveChat(chat.chat_id, {
          title: chat.title,
          type: chat.type,
          avatar_url: chat.avatar_url,
          avatar_color: chat.avatar_color,
          participants: chat.participants,
        })
        navigate(`/chat/${chat.chat_id}`)
      }}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive ?
          'bg-sky-600 text-white'
          : 'hover:dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-300'
      }`}
    >
      <div
        className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-xl"
        style={{ backgroundColor: chat.avatar_color || '#8ECAE6' }}
      >
        {chat.title[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex justify-between items-center gap-2">
          <span className={`
            text-sm font-semibold truncate
            ${isActive ? 'text-white' : 'text-slate-800 dark:text-sky-400'}
          `}>{chat.title}</span>
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
        <div className={`
          text-[13px] truncate
          ${isActive ? 'white' : 'text-slate-500'}
        `}>
          {chat.lastMessage?.content || 'Нет сообщений'}
        </div>
      </div>
    </div>
  )
}