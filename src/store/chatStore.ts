import { create } from 'zustand'
import type { UiChatActive } from '../types'

interface EditingMessage {
  id: string
  content: string
}

interface ChatState {
  activeChatId: string | null
  activeChatData: UiChatActive | null
  setActiveChat: (chatId: string | null, data?: UiChatActive | null) => void
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
