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