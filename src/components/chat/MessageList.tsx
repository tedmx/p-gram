import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { MessageContextMenu } from './MessageContextMenu'
import { getMessages, deleteMessage } from '../../api/messages'
import { Modal } from '../ui/Modal'
import { EmojiText } from '../ui/EmojiText'

interface MessageListProps {
  chatId: string
}

export const MessageList = ({ chatId }: MessageListProps) => {
  const currentUser = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const { editingMessage, setEditingMessage } = useChatStore()
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number, msg: any } | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null)
  const [deleteForEveryone, setDeleteForEveryone] = useState(false)

  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY, msg })
  }
  
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(chatId),
    refetchInterval: 3000 // Временный "поллинг" каждые 3 сек, пока не включим Realtime
  })

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      // Инвалидируем кеш, чтобы сообщение исчезло из списка
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Прокручиваем к самому низу при изменении количества сообщений
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const { activeChatData } = useChatStore() // Достаем данные текущего чата
  const chatPartnerName = useMemo(() => {
    if (!activeChatData || !currentUser) return 'собеседника'
    
    // Ищем участника, который не является текущим пользователем
    const partner = activeChatData.participants?.find(
      (p: any) => p.id !== currentUser.id
    )
    
    return partner?.username || 'собеседника'
  }, [activeChatData, currentUser])

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
                  ? 'bg-green-100 text-slate-900 dark:bg-sky-600 dark:text-white rounded-br-none' 
                  : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none'}
                ${
                  editingMessage?.id === msg.id
                    ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : ''
                }
              `}>
                {msg.image_url && (
                  <img 
                    src={msg.image_url} 
                    alt="Attachment" 
                    className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(msg.image_url, '_blank')}
                  />
                )}
                <EmojiText text={msg.content} />
                <div className={`
                  float-right mt-2 ml-2 flex items-center gap-1
                  ${isMine
                    ? 'text-green-600 dark:text-sky-200/70'
                    : 'text-slate-400 dark:text-slate-500'}
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
            onDelete={() => {
              setMessageToDelete(menuPosition.msg.id)
              setMenuPosition(null)
            }}
          />
        )}
        <Modal
          isOpen={!!messageToDelete} 
          onClose={() => setMessageToDelete(null)} 
          title="Удаление сообщения"
        >
          <p className="text-slate-400 text-sm mb-6">
            Вы уверены, что хотите удалить это сообщение?
          </p>

          {/* Чекбокс */}
          <label className="flex items-center gap-3 mb-8 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={deleteForEveryone}
              onChange={(e) => setDeleteForEveryone(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500/20"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Также удалить для {chatPartnerName} {/* Имя возьми из данных чата */}
            </span>
          </label>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setMessageToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button 
              onClick={() => {
                handleDelete(messageToDelete)
                setMessageToDelete(null)
              }}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Удалить
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
