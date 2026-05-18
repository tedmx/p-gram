// src/hooks/usePresence.ts
import { useEffect } from 'react'
import { supabase } from '../api/supabase'
import { useAuthStore } from '../store/authStore'
import { queryClient } from '../api/queryClient'

export const usePresence = () => {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.id) return

    // Создаем глобальный канал для отслеживания присутствия
    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        // Когда кто-то заходит/выходит, мы можем инвалидировать кэш чатов,
        // чтобы подтянулись новые данные о пользователях
        queryClient.invalidateQueries({ queryKey: ['my-chats'] })
        queryClient.invalidateQueries({ queryKey: ['active-chat-data'] })
      })

    // Подключаемся и передаем метаданные текущего пользователя
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
        })

        // При входе обновляем last_seen текущего пользователя в таблице
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id)
      }
    })

    // Регулярный пинг раз в 2 минуты, пока вкладка открыта, чтобы обновлять last_seen в БД
    const interval = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id)
    }, 120000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [user?.id])
}
