import { useQuery } from '@tanstack/react-query'
import { getMessages } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { MessageContextMenu } from './MessageContextMenu'

interface MessageListProps {
  chatId: string
}

export const MessageList = ({ chatId }: MessageListProps) => {
  const currentUser = useAuthStore(state => state.user)
  const { editingMessage, setEditingMessage } = useChatStore()
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number, msg: any } | null>(null)


  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY, msg })
  }
  
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(chatId),
    refetchInterval: 3000 // Временный "поллинг" каждые 3 сек, пока не включим Realtime
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Прокручиваем к самому низу при изменении количества сообщений
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])


  if (isLoading) return <div className="p-4 text-slate-500 text-center">Загрузка сообщений...</div>

  return (
    <div
      ref={scrollRef} 
      className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col scrollbar-thin scrollbar-thumb-slate-800 scroll-smooth w-full"
    >
      <div className="mx-auto w-full max-w-[45.5rem] [@media(min-width:1921px)]:max-w-[50vw] space-y-4">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === currentUser?.id
          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
            >
              <div className={`
                max-w-[70%] rounded-2xl px-4 py-2 relative group transition-all duration-300
                ${isMine 
                  ? 'bg-sky-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none'}
                ${editingMessage?.id === msg.id ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : ''}
              `}>
                <span>{msg.content}</span>
                <div className={`
                  float-right mt-2 ml-2 flex items-center gap-1
                  ${isMine ? 'text-sky-200/70' : 'text-slate-500'}
                `}>
                  {msg.is_edited && (
                    <span
                      className="text-[10px] italic select-none"
                      title="Сообщение отредактировано"
                    >
                      ред.
                    </span>
                  )}
                  <span className="text-[10px]">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="clear-both" />
              </div>
            </div>
          )
        })}
        {menuPosition && (
          <MessageContextMenu 
            position={{ x: menuPosition.x, y: menuPosition.y }}
            onClose={() => setMenuPosition(null)}
            onEdit={() => setEditingMessage({ id: menuPosition.msg.id, content: menuPosition.msg.content })}
          />
        )}
      </div>
    </div>
  )
}
