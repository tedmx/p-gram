import { supabase } from './supabase'
import type { UiChat } from '../types'
import {
  mapMyChatsRowsToUiChats,
  type SupabaseMyChatsRow,
} from '../mappers/chatMappers'

export const getOrCreateChat = async (currentUserId: string, targetUserId: string) => {
  // 1. Ищем существующий приватный чат
  // Мы ищем чаты, где оба пользователя являются участниками
  const { data: existingChat, error: searchError } = await supabase
    .rpc('get_direct_chat_between_users', {
      user1_id: currentUserId,
      user2_id: targetUserId
    })

  if (searchError) throw searchError
  if (existingChat && existingChat.length > 0) return existingChat[0].chat_id

  // 2. Если чата нет, создаем новый
  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({ type: 'direct' })
    .select()
    .single()

  if (chatError) throw chatError

  // 3. Добавляем участников
  const participants = [
    { chat_id: newChat.id, user_id: currentUserId },
    { chat_id: newChat.id, user_id: targetUserId }
  ]

  const { error: partError } = await supabase
    .from('participants')
    .insert(participants)

  if (partError) throw partError

  return newChat.id
}

export const getMyChats = async (userId: string): Promise<UiChat[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      chat_id,
      is_manual_unread,
      chats (
        id,
        type,
        participants (
          user_id,
          profiles (id, username, avatar_url, avatar_color, bio, birthday)
        ),
        messages (
          id,
          content,
          created_at,
          sender_id,
          read
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { foreignTable: 'chats.messages', ascending: false })

  if (error) throw error
  if (!data?.length) return []
  
  // Сортируем сам массив чатов на стороне фронтенда перед возвратом
  const mappedChats = mapMyChatsRowsToUiChats(data as SupabaseMyChatsRow[], userId)

  return mappedChats.sort((a, b) => {
    const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
    const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
    return timeB - timeA // Свежие сверху
  })
}

export const setManualUnreadStatus = async (chatId: string, userId: string, status: boolean) => {
  const { error } = await supabase
    .from('participants')
    .update({ is_manual_unread: status })
    .eq('chat_id', chatId)
    .eq('user_id', userId)

  if (error) throw error
}
