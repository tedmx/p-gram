import { create } from 'zustand'

interface ChatData {
  title: string
  type: 'direct' | 'group'
  avatar_url?: string | null
}

interface EditingMessage {
  id: string
  content: string
}

interface ChatState {
  activeChatId: string | null
  activeChatData: ChatData | null
  setActiveChat: (chatId: string | null, data?: ChatData | null) => void
  editingMessage: EditingMessage | null
  setEditingMessage: (msg: EditingMessage | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  activeChatData: null,
  setActiveChat: (chatId, data = null) => set({ 
    activeChatId: chatId, 
    activeChatData: data 
  }),
  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
}))
