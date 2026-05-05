import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X, Search, Send, Bookmark } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { sendMessage } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'
import { EmojiText } from '../ui/EmojiText'
import { Avatar } from '../ui/Avatar'

import type { UiChat } from '../../types'

export const ForwardModal = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  
  const currentUser = useAuthStore(state => state.user)
  const { 
    forwardingMessage, 
    selectedForwardChats, 
    toggleForwardChat, 
    resetForwarding 
  } = useChatStore()

  // 1. Подтягиваем список чатов из кэша
  const allChats = queryClient.getQueryData<UiChat[]>(['my-chats', currentUser?.id]) || []

  // 2. Логика фильтрации и сортировки (Избранное первым)
  const filteredChats = allChats
    .filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.title === 'Saved Messages') return -1
      if (b.title === 'Saved Messages') return 1
      return 0
    })

  const [additionalText, setAdditionalText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleForward = async () => {
    if (!forwardingMessage || selectedForwardChats.length === 0) return
    
    setIsSending(true)
    
    try {
      // Проходим циклом по всем выбранным ID чатов
      const sendPromises = selectedForwardChats.map(async (targetChatId) => {
        
        // 1. Сначала отправляем само пересланное сообщение
        await sendMessage(
          targetChatId,
          currentUser!.id,
          forwardingMessage.content,
          undefined, // imageUrl (можно добавить, если в оригинале была картинка)
          null,      // reply_to_id (при форварде обычно не сохраняем оригинальный ответ)
          forwardingMessage.id // forwarded_from_id — наш новый параметр
        )

        // 2. Если пользователь ввел дополнительный текст, отправляем его вторым сообщением
        if (additionalText.trim()) {
          await sendMessage(
            targetChatId,
            currentUser!.id,
            additionalText.trim()
          )
        }

        // Инвалидируем кэш сообщений для этого чата, чтобы обновить UI
        queryClient.invalidateQueries({ queryKey: ['messages', targetChatId] })
      })

      await Promise.all(sendPromises)
      
      // Обновляем список чатов в сайдбаре (чтобы поднялись наверх те, куда отправили)
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
      
      resetForwarding() // Закрываем модалку и чистим стейт
    } catch (error) {
      console.error('Forwarding failed:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!forwardingMessage) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        
        {/* Первая строка: заголовок и закрытие */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button onClick={resetForwarding} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Выберите получателей</h2>
          <div className="w-8" /> {/* Фантомный блок для центровки */}
        </div>

        {/* Вторая строка: Поиск */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Секция чатов (скролл) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filteredChats.map(chat => {
            const isSelected = selectedForwardChats.includes(chat.chat_id)

            const isSavedMessages = chat.type === 'direct' && chat.participants?.length === 1

            const displayTitle = isSavedMessages ? 'Избранное' : chat.title
            
            return (
              <div 
                key={chat.chat_id}
                onClick={() => toggleForwardChat(chat.chat_id)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                  ${isSelected ? 'bg-sky-100 dark:bg-sky-900/40' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}
                `}
              >
                {/* Используем AvatarFallback для отображения аватарок или букв */}
                <Avatar
                  src={isSavedMessages ? null : chat.avatar_url} 
                  name={displayTitle || '?'} 
                  backgroundColor={isSavedMessages ? 'rgb(14 165 233)' : chat.avatar_color} 
                  className="w-12 h-12 shrink-0"
                >
                  {isSavedMessages && <Bookmark className="w-6 h-6 fill-white text-white" />}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {/* Используем EmojiText для поддержки эмодзи в именах и корректного вывода */}
                    <EmojiText text={isSavedMessages ? 'Избранное' : (chat.title || 'Неизвестный')} />
                  </div>
                </div>


                <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all
                  ${isSelected ? 'bg-sky-500 border-sky-500' : 'border-slate-300 dark:border-slate-600'}
                `}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          {selectedForwardChats.length <= 1 ? (
            <button 
              disabled={selectedForwardChats.length === 0 || isSending}
              onClick={handleForward}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex justify-center items-center"
            >
              {isSending ? 'Отправка...' : selectedForwardChats.length === 1 ? 'Переслать' : 'Выберите чаты'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Добавить сообщение..."
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                disabled={isSending}
                className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm outline-none"
              />
              <button
                onClick={handleForward} // Вызываем функцию для нескольких чатов
                disabled={isSending}
                className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors disabled:bg-slate-300"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
