import { useEffect } from 'react'
import { supabase } from '../api/supabase'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Подписываемся на изменения состояния (логин/логаут)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])
}
