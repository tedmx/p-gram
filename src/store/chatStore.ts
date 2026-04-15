import { create } from 'zustand'
import type { UiChatActive } from '../types'

interface EditingMessage {
  id: string
  content: string
}

interface ChatState {
  activeChatId: string | null
  activeChatData: UiChatActive | null
  sidebarVisible: boolean // For 601-925px range: controls sidebar visibility when chat is open
  setActiveChat: (chatId: string | null, data?: UiChatActive | null) => void
  setSidebarVisible: (visible: boolean) => void
  editingMessage: EditingMessage | null
  setEditingMessage: (msg: EditingMessage | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  activeChatData: null,
  sidebarVisible: false,
  setActiveChat: (chatId, data = null) => set({ 
    activeChatId: chatId, 
    activeChatData: data,
    // When opening a chat, hide sidebar by default (full-width chat mode)
    sidebarVisible: chatId ? false : false
  }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
}))
