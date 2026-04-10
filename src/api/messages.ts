import { supabase } from './supabase'

export const getMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content
    })

  if (error) throw error
}

export const updateMessage = async (messageId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ 
      content, 
      is_edited: true, // Хорошая практика — помечать измененные сообщения
      updated_at: new Date().toISOString() 
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteMessage = async (id: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)

  if (error) throw error
}
