import { useNavigate } from 'react-router-dom'

import { useChatStore } from '../../store/chatStore'
import { type UiChat } from '../../types'
import { EmojiText } from '../ui/EmojiText'
import { SentIcon, ReadIcon } from './ReadStatus'
import { Avatar } from '../ui/Avatar'
import { GenericMenu, type MenuOption } from '../ui/GenericMenu'
import { useState } from 'react'
import { markChatAsRead } from '../../api/messages'
import { queryClient } from '../../api/queryClient'
import { setManualUnreadStatus } from '../../api/chats'
import { Bookmark, Info, MessageSquareCheck, MessageSquareDot } from 'lucide-react'
import { formatMessageDate } from '../../utils/dateUtils'

interface ChatItemProps {
  chat: UiChat
  isActive: boolean
  currentUserId: string | undefined
}

export const ChatItem = ({ chat, isActive, currentUserId }: ChatItemProps) => {
  const setActiveChat = useChatStore(state => state.setActiveChat)
  const navigate = useNavigate()
  const isMyLastMessage = chat.lastMessage?.sender_id === currentUserId
  const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null)
  const {openModal} = useChatStore()

  const isManual = chat.is_manual_unread
  const showUnread = chat.unread_count > 0 || isManual

  const isCurrentlyUnread = chat.unread_count > 0 || chat.is_manual_unread

  const isSavedMessages = chat.type === 'direct' && chat.participants?.length === 1
  const displayTitle = isSavedMessages ? 'Избранное' : chat.title

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  const menuOptions: MenuOption[] = [
    {
      label: isCurrentlyUnread ? 'Пометить прочитанным' : 'Пометить непрочитанным',
      icon: isCurrentlyUnread ? MessageSquareCheck : MessageSquareDot,
      onClick: async () => {
        if (!currentUserId) return

        const newStatus = !isCurrentlyUnread
        
        // 1. Отправляем запрос в БД
        await setManualUnreadStatus(chat.chat_id, currentUserId, newStatus)
        
        // 2. Если помечаем прочитанным и есть реальные сообщения — гасим их как раньше
        if (isCurrentlyUnread && chat.unread_count > 0) {
          await markChatAsRead(chat.chat_id, currentUserId)
        }

        // 3. Обновляем список чатов, чтобы интерфейс перерисовался с данными из БД
        queryClient.invalidateQueries({ queryKey: ['my-chats'] })
      }
    },
    {
      label: 'Информация о чате',
      icon: Info,
      onClick: () => {
        setActiveChat(chat.chat_id, chat) 
        openModal('chat-info')
      }
    }
  ]

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
          is_manual_unread: chat.is_manual_unread,
        })
        navigate(`/chat/${chat.chat_id}`)
      }}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive ?
          'bg-sky-600 text-white'
          : 'hover:dark:bg-slate-800/50 hover:bg-slate-300/50 text-slate-300'
      }`}
      onContextMenu={handleContextMenu}
    >
      <Avatar
        src={isSavedMessages ? null : chat.avatar_url} 
        name={displayTitle || '?'} 
        backgroundColor={isSavedMessages ? 'rgb(14 165 233)' : chat.avatar_color} 
        className="w-12 h-12 shrink-0 text-xl" 
      >
        {isSavedMessages && <Bookmark className="w-6 h-6 fill-white text-white" />}
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Верхняя строка: Имя + Статус + Время */}
        <div className="flex justify-between items-center mb-0.5">
          <span className={`
            text-sm font-semibold truncate
            ${isActive ? 'text-white' : 'text-slate-800 dark:text-sky-400'}
          `}>
            <EmojiText text={displayTitle} />
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
              {chat.lastMessage ? formatMessageDate(chat.lastMessage.created_at) : ''}
            </span>
          </div>
        </div>

        {/* Нижняя строка: Превью (увеличенное) + Круг с числом */}
        <div className="flex justify-between items-center gap-2">
          <div className={`
            text-[14px] truncate flex-1
            ${isActive ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}
          `}>
            {chat.lastMessage?.content ? (
              <EmojiText 
                text={chat.lastMessage.content} 
                className="truncate" 
              />
            ) : (
              <span className="italic opacity-60">Нет сообщений</span>
            )}
          </div>

          {showUnread && (
            <div className={`
              bg-sky-500 text-white rounded-full flex items-center justify-center shadow-sm transition-all
              ${isManual && chat.unread_count === 0 
                ? 'w-5 h-5 my-auto' // Точка для ручной пометки
                : 'min-w-5 h-5 px-1.5 text-[10px] font-bold'}
            `}>
              {chat.unread_count > 0 ? (chat.unread_count > 99 ? '99+' : chat.unread_count) : ''}
            </div>
          )}
        </div>
      </div>

      {menuPos && (
        <GenericMenu
          position={menuPos} 
          options={menuOptions} 
          onClose={() => setMenuPos(null)} 
        />
      )}
    </div>
  )
}
