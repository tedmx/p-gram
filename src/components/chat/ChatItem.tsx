import { useNavigate } from 'react-router-dom'

import { useChatStore } from '../../store/chatStore'
import { type UiChat } from '../../types'
import { AvatarFallback } from '../ui/AvatarFallback'
import { EmojiText } from '../ui/EmojiText'
import { SentIcon, ReadIcon } from './ReadStatus'

interface ChatItemProps {
  chat: UiChat
  isActive: boolean
  currentUserId: string | undefined
}

export const ChatItem = ({ chat, isActive, currentUserId }: ChatItemProps) => {
  const setActiveChat = useChatStore(state => state.setActiveChat)
  const navigate = useNavigate()
  const isMyLastMessage = chat.lastMessage?.sender_id === currentUserId

  const time = chat.lastMessage
    ? new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      <AvatarFallback
        label={chat.title}
        backgroundColor={chat.avatar_color}
        className="w-12 h-12 shrink-0 text-xl"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex justify-between items-center gap-2">
          <span className={`
            text-sm font-semibold truncate
            ${isActive ? 'text-white' : 'text-slate-800 dark:text-sky-400'}
          `}>
            <EmojiText text={chat.title} />
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isMyLastMessage && chat.lastMessage && (
              chat.lastMessage.read ? (
                <ReadIcon className={`w-5 h-5 ${isActive ? 'text-sky-100' : 'text-sky-500'}`} />
              ) : (
                <SentIcon className={`w-4 h-4 ${isActive ? 'text-sky-100' : 'text-sky-500'}`} />
              )
            )}
            <span className={`text-[11px] ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
              {time}
            </span>
          </div>
        </div>
        <div className={`
          text-[13px] truncate
          ${isActive ? 'text-white' : 'text-slate-500'}
        `}>
          {chat.lastMessage?.content ? (
            <EmojiText text={chat.lastMessage.content} />
          ) : (
            'Нет сообщений'
          )}
        </div>
      </div>
    </div>
  )
}