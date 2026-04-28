import { create } from 'zustand'
import type { ModalMode, UiChatActive } from '../types'
import { useAuthStore } from './authStore'
import { setManualUnreadStatus } from '../api/chats'
import { queryClient } from '../api/queryClient'

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
  modalMode: ModalMode
  openModal: (mode: ModalMode) => void
  closeModal: () => void
  manualUnread: Record<string, boolean>,
  setManualUnread: (chatId: string, value: boolean) => void,
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  activeChatData: null,
  sidebarVisible: false,
  setActiveChat: async (chatId, data = null) => {
    set({ 
      activeChatId: chatId, 
      activeChatData: data,
      sidebarVisible: false 
    })

    if (chatId) {
      try {
        // Нам нужен ID текущего пользователя. 
        // Если authStore импортирован, можно достать так:
        const userId = useAuthStore.getState().user?.id
        
        if (userId) {
          await setManualUnreadStatus(chatId, userId, false)
          // Инвалидируем кэш, чтобы Sidebar узнал об изменениях
          queryClient.invalidateQueries({ queryKey: ['my-chats'] })
        }
      } catch (error) {
        console.error('Failed to reset manual unread:', error)
      }
    }
  },
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  modalMode: null,
  openModal: (mode) => set({ modalMode: mode }),
  closeModal: () => set({ modalMode: null }),
  manualUnread: {},
  setManualUnread: (chatId, value) => set((state) => ({
    manualUnread: { ...state.manualUnread, [chatId]: value }
  })),
}))
