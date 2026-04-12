import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { UiChat } from '../types'
import { useChatStore } from '../store/chatStore'

/**
 * Держит Zustand activeChat в согласованности с URL `/chat/:chatId` и списком `myChats`.
 */
export function useChatRouteSync(myChats: UiChat[] | undefined) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeChatId = useChatStore((s) => s.activeChatId)
  const setActiveChat = useChatStore((s) => s.setActiveChat)

  const chatIdFromPath = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/([^/]+)$/)
    return match?.[1] ?? null
  }, [location.pathname])

  useEffect(() => {
    if (!myChats) return

    if (!chatIdFromPath) {
      if (activeChatId) setActiveChat(null)
      return
    }

    const targetChat = myChats.find((chat) => chat.chat_id === chatIdFromPath)

    if (!targetChat) {
      setActiveChat(null)
      navigate('/', { replace: true })
      return
    }

    if (activeChatId === targetChat.chat_id) return

    setActiveChat(targetChat.chat_id, {
      title: targetChat.title,
      type: targetChat.type,
      avatar_url: targetChat.avatar_url,
      avatar_color: targetChat.avatar_color,
      participants: targetChat.participants,
    })
  }, [activeChatId, chatIdFromPath, myChats, navigate, setActiveChat])
}
