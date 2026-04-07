import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchUsers } from '../../api/users'

import { useAuthStore } from '../../store/authStore'
import { getOrCreateChat } from '../../api/chats'
import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '../../store/chatStore' 

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: foundUsers, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length >= 3,
  })

  const currentUser = useAuthStore(state => state.user)
  const setActiveChat = useChatStore(state => state.setActiveChat)

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
          <div className="text-sm text-slate-500 px-3 text-center mt-4">Ваши диалоги появятся здесь</div>
        )}
      </div>
    </div>
  )
}
