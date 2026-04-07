import { useQuery } from '@tanstack/react-query'
import { getMessages } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useRef } from 'react'

interface MessageListProps {
  chatId: string
}

export const MessageList = ({ chatId }: MessageListProps) => {
  const currentUser = useAuthStore(state => state.user)
  
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
      {messages?.map((msg) => {
        const isMine = msg.sender_id === currentUser?.id
        return (
          <div 
            key={msg.id} 
            className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                isMine 
                  ? 'bg-sky-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
