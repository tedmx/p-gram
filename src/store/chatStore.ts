import { create } from 'zustand'

interface ChatData {
  title: string
  type: 'direct' | 'group'
  avatar_url?: string | null
}

interface ChatState {
  activeChatId: string | null
  activeChatData: ChatData | null
  setActiveChat: (chatId: string | null, data?: ChatData | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  activeChatData: null,
  setActiveChat: (chatId, data = null) => set({ 
    activeChatId: chatId, 
    activeChatData: data 
  }),
}))
