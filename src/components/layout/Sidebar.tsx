import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { searchUsers } from '../../api/users'

import { useAuthStore } from '../../store/authStore'
import { getMyChats, getOrCreateChat } from '../../api/chats'
import { useMutation } from '@tanstack/react-query'
import { useChatStore } from '../../store/chatStore' 
import { ChatItem } from '../chat/ChatItem'
import { useLocation, useNavigate } from 'react-router-dom'

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()

  const currentUser = useAuthStore(state => state.user)

  const { data: foundUsers, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length >= 3,
  })

  const { activeChatId, setActiveChat } = useChatStore()

  const { data: myChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['my-chats', currentUser?.id],
    queryFn: () => getMyChats(currentUser!.id),
    enabled: !!currentUser
  })

  const { mutate: handleSelectUser } = useMutation({
    mutationFn: (targetUser: { id: string, username: string, avatar_color?: string | null, avatar_url?: string | null }) => {
      if (!currentUser) throw new Error('Not authenticated')
      return getOrCreateChat(currentUser.id, targetUser.id).then(chatId => ({
        chatId,
        title: targetUser.username,
        avatar_color: targetUser.avatar_color || null,
        avatar_url: targetUser.avatar_url || null,
      }))
    },
    onSuccess: (data) => {
      setActiveChat(data.chatId, {
        title: data.title,
        type: 'direct',
        avatar_color: data.avatar_color,
        avatar_url: data.avatar_url,
      })
      navigate(`/chat/${data.chatId}`)
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  const chatIdFromPath = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)$/)
    return match?.[1] || null
  }, [location.pathname])

  useEffect(() => {
    if (!myChats) return

    if (!chatIdFromPath) {
      if (activeChatId) {
        setActiveChat(null)
      }
      return
    }

    const targetChat = myChats.find((chat) => chat.chat_id === chatIdFromPath)

    if (!targetChat) {
      setActiveChat(null)
      navigate('/', { replace: true })
      return
    }

    if (activeChatId === targetChat.chat_id) return

    setActiveChat(targetChat.chat_id, {
      title: targetChat.title,
      type: targetChat.type,
      avatar_url: targetChat.avatar_url,
      avatar_color: targetChat.avatar_color,
      participants: targetChat.participants,
    })
  }, [activeChatId, chatIdFromPath, myChats, navigate, setActiveChat])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-slate-800">
        <input 
          type="text"
          placeholder="Поиск людей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-400"
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
                  onClick={() => handleSelectUser({
                    id: user.id,
                    username: user.username,
                    avatar_color: user.avatar_color,
                    avatar_url: user.avatar_url,
                  })}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border border-transparent"
                    style={{ backgroundColor: user.avatar_color || '#8ECAE6' }}
                  >
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
            <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 mb-2 font-bold">Диалоги</div>
            {chatsLoading ? (
              <div className="px-3 text-sm text-slate-500 animate-pulse">Загрузка...</div>
            ) : (
              myChats?.map(chat => {
                return (
                  <ChatItem
                    key={chat.chat_id}
                    chat={chat}
                    isActive={activeChatId === chat.chat_id}
                    currentUserId={currentUser?.id}
                  />
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
