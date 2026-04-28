import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { getMyChats, getOrCreateChat } from '../../api/chats'
import { searchUsers } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import { useChatRouteSync } from '../../hooks/useChatRouteSync'
import { useChatStore } from '../../store/chatStore'
import { AvatarFallback } from '../ui/AvatarFallback'
import { EmojiText } from '../ui/EmojiText'
import { ChatItem } from '../chat/ChatItem'

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
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

  useChatRouteSync(myChats)

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
        is_manual_unread: false,
      })
      navigate(`/chat/${data.chatId}`)
      setSearchQuery('')
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <input 
          type="text"
          placeholder="Поиск людей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-slate-200"
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
                  <AvatarFallback
                    label={user.username ?? '?'}
                    backgroundColor={user.avatar_color}
                    className="w-10 h-10 border border-transparent"
                  />
                  <div className="text-sm font-medium group-hover:text-sky-400 transition-colors">
                    <EmojiText text={user.username} />
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
