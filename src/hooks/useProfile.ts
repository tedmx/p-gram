import { useQuery } from '@tanstack/react-query'
import { supabase } from '../api/supabase'
import type { Profile } from '../types'
import { useAuthStore } from '../store/authStore'

export const useProfile = () => {
  const user = useAuthStore(state => state.user)

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, avatar_color, bio, birthday')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Ошибка загрузки профиля:', error)
        return null
      }

      // Если профиля нет, создаём базовый
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'Пользователь',
          })
          .select()
          .single()

        if (insertError) throw insertError
        return newProfile
      }

      return data
    },
    enabled: !!user?.id,
  })
}
