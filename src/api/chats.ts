import { supabase } from './supabase'

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
// Описываем структуру, которую вернет .select()
export interface SupabaseChatResponse {
  chat_id: string
  chats: {
    id: string
    type: 'direct' | 'group'
    participants: {
      user_id: string
      profiles: {
        id: string
        username: string
        avatar_url: string | null
      }
    }[]
    messages: {
      content: string
      created_at: string
      sender_id: string
    }[]
  } | null
}

export const getMyChats = async (userId: string) => {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      chat_id,
      chats (
        id,
        type,
        participants (
          user_id,
          profiles (id, username, avatar_url)
        ),
        messages (
          content,
          created_at,
          sender_id
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { foreignTable: 'chats.messages', ascending: false })
    .limit(1, { foreignTable: 'chats.messages' })

  if (error) throw error
  return (data as unknown) as SupabaseChatResponse[]
}
