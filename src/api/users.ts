import { supabase } from './supabase'

export const searchUsers = async (query: string) => {
  if (query.length < 3) return [] // Не ищем, пока мало символов

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Search error:', error)
    return []
  }
  return data || []
}
