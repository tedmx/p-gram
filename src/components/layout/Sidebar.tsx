import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { searchUsers } from '../../api/users'

import { useAuthStore } from '../../store/authStore'
import { getMyChats, getOrCreateChat } from '../../api/chats'
import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '../../store/chatStore' 

import type { MyChat } from '../../types'

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const currentUser = useAuthStore(state => state.user)

  const { data: foundUsers, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length >= 3,
  })

  const { activeChatId, setActiveChat } = useChatStore()

  const { data: myChats, isLoading: chatsLoading } = useQuery<MyChat[]>({
    queryKey: ['my-chats', currentUser?.id],
    queryFn: async () => {
      const rawData = await getMyChats(currentUser!.id)
      
      return rawData
        .filter(item => item.chats !== null) // Убираем битые данные
        .map(item => {
          const chat = item.chats!
          const partner = chat.participants.find(p => p.user_id !== currentUser?.id)?.profiles
          const lastMsg = chat.messages?.[0]

          return {
            chat_id: item.chat_id,
            title: partner?.username || 'Неизвестный',
            type: chat.type,
            avatar_url: partner?.avatar_url || null,
            lastMessage: lastMsg ? {
              content: lastMsg.content,
              createdAt: lastMsg.created_at,
              senderId: lastMsg.sender_id
            } : null
          }
        })
    },
    enabled: !!currentUser
  })

  const { mutate: handleSelectUser } = useMutation({
    mutationFn: (targetUser: { id: string, username: string }) => {
      if (!currentUser) throw new Error('Not authenticated')
      return getOrCreateChat(currentUser.id, targetUser.id).then(chatId => ({
        chatId,
        title: targetUser.username // Сохраняем имя для заголовка
      }))
    },
    onSuccess: (data) => {
      setActiveChat(data.chatId, { title: data.title, type: 'direct' })
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <input 
          type="text"
          placeholder="Поиск людей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery.length >= 3 ? (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 mb-2">Глобальный поиск</div>
            {isSearching ? (
              <div className="px-3 text-sm text-slate-400 animate-pulse">Поиск...</div>
            ) : (
              foundUsers?.map(user => (
                <div 
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-500/10 cursor-pointer group transition-colors"
                  onClick={() => handleSelectUser({ id: user.id, username: user.username })} // Заглушка для следующего шага
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold border border-slate-700">
                    {user.username?.[0].toUpperCase() || '?'}
                  </div>
                  <div className="text-sm font-medium group-hover:text-sky-400 transition-colors">
                    {user.username}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {chatsLoading ? (
              <div className="p-4 text-slate-500 animate-pulse">Загрузка...</div>
            ) : (
              myChats?.map(chat => {
                const isActive = activeChatId === chat.chat_id
                const isMyLastMessage = chat.lastMessage?.senderId === currentUser?.id
  
                // Форматируем время (например, 14:05)
                const time = chat.lastMessage 
                  ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''

                return (
                  <div 
                    key={chat.chat_id}
                    onClick={() => setActiveChat(chat.chat_id, { title: chat.title, type: chat.type })}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Аватарка */}
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold border ${
                      isActive ? 'bg-sky-500 border-sky-400' : 'bg-slate-700 border-slate-600 text-sky-400'
                    }`}>
                      {chat.title[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      {/* ВЕРХНЯЯ СТРОКА: Имя + Время/Статус */}
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-sm font-semibold truncate">{chat.title}</span>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Галочки, если последнее сообщение наше */}
                          {isMyLastMessage && (
                            <svg 
                              className={`w-4 h-4 ${isActive ? 'text-sky-100' : 'text-sky-500'}`} 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M7 13l3 3 7-7" />
                              <path d="M12 13l3 3 7-7" />
                            </svg>
                          )}
                          <span className={`text-[11px] ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                            {time}
                          </span>
                        </div>
                      </div>

                      {/* НИЖНЯЯ СТРОКА: Превью сообщения */}
                      <div className={`text-[13px] truncate ${isActive ? 'text-sky-100/80' : 'text-slate-500'}`}>
                        {chat.lastMessage?.content || 'Нет сообщений'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
