import { useNavigate } from 'react-router-dom'

import { useChatStore } from '../../store/chatStore'
import { type UiChat } from '../../types'
import { EmojiText } from '../ui/EmojiText'
import { SentIcon, ReadIcon } from './ReadStatus'
import { Avatar } from '../ui/Avatar'

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
          unread_count: chat.unread_count,
        })
        navigate(`/chat/${chat.chat_id}`)
      }}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive ?
          'bg-sky-600 text-white'
          : 'hover:dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-300'
      }`}
    >
      <Avatar
        src={chat.avatar_url} 
        name={chat.title || '?'} 
        backgroundColor={chat.avatar_color}
        className="w-12 h-12 shrink-0 text-xl" 
      />

      <div className="flex-1 min-w-0">
        {/* Верхняя строка: Имя + Статус + Время */}
        <div className="flex justify-between items-center mb-0.5">
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

        {/* Нижняя строка: Превью (увеличенное) + Круг с числом */}
        <div className="flex justify-between items-center gap-2">
          <div className={`
            text-[14px] truncate flex-1
            ${isActive ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}
          `}>
            {chat.lastMessage?.content || 'Нет сообщений'}
          </div>

          {chat.unread_count > 0 && (
            <div className="bg-sky-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 shadow-sm animate-in zoom-in duration-200 shrink-0">
              <span className="leading-none flex items-center justify-center pt-[0.5px]">
                {chat.unread_count > 99 ? '99+' : chat.unread_count}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
