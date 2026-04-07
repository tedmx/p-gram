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
