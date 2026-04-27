import type { Profile } from '../types'
import { supabase } from './supabase'

export const searchUsers = async (query: string) => {
  if (query.length < 3) return [] // Не ищем, пока мало символов

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, avatar_color')
    .ilike('username', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Search error:', error)
    return []
  }
  return data || []
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export const uploadAvatar = async (userId: string, file: Blob) => {
  // Путь: id_пользователя/рандомный_ключ.webp
  const filePath = `${userId}/${Date.now()}.webp`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true,
      contentType: 'image/webp'
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

export const deleteAvatarFile = async (url: string) => {
  const path = url.split('avatars/').pop()
  if (path) {
    await supabase.storage.from('avatars').remove([path])
  }
}
