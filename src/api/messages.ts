import { supabase } from './supabase'

export const getMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map(msg => ({
    ...msg,
    read: msg.read || false
  }))
}

export const uploadImage = async (file: File) => {
  // Получаем расширение файла
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  
  // Генерируем безопасное имя файла
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = fileName

  console.log('📤 Загружаем файл:', filePath, 'Размер:', file.size, 'Тип:', file.type)

  const { data, error } = await supabase.storage
    .from('misc-uploads')
    .upload(filePath, file)

  if (error) {
    console.error('❌ Ошибка загрузки:', error)
    throw error
  }

  console.log('✅ Загрузка успешна:', data)

  // Получаем публичную ссылку
  const { data: { publicUrl } } = supabase.storage
    .from('misc-uploads')
    .getPublicUrl(filePath)

  console.log('🔗 Публичный URL:', publicUrl)

  return publicUrl
}

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string,
  imageUrl?: string,
  reply_to_id?: string | null,
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      chat_id: chatId,
      sender_id: senderId,
      content,
      image_url: imageUrl,
      read: false,
      reply_to_id,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateMessage = async (messageId: string, content: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ 
      content, 
      is_edited: true,
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

export const markAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)

  if (error) throw error
}

export const markChatAsRead = async (chatId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .eq('read', false)

  if (error) console.error('Error marking as read:', error)
}
