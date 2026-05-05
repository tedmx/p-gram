import { create } from 'zustand'
import type { Message, ModalMode, UiChatActive } from '../types'
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
  replyMessage: Message | null
  setReplyMessage: (msg: Message | null) => void
  forwardingMessage: Message | null
  setForwardingMessage: (msg: Message | null) => void
  selectedForwardChats: string[] // ID выбранных чатов в модалке
  toggleForwardChat: (chatId: string) => void
  resetForwarding: () => void
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
  setEditingMessage: (msg) => set({
    editingMessage: msg,
    replyMessage: null,
    forwardingMessage: null, // Сбрасываем форвард при редактировании
  }),
  modalMode: null,
  openModal: (mode) => set({ modalMode: mode }),
  closeModal: () => set({ modalMode: null }),
  manualUnread: {},
  setManualUnread: (chatId, value) => set((state) => ({
    manualUnread: { ...state.manualUnread, [chatId]: value }
  })),
  replyMessage: null,
  setReplyMessage: (msg) => set({ 
    replyMessage: msg, 
    editingMessage: null,
    forwardingMessage: null,
  }),
  forwardingMessage: null,
  setForwardingMessage: (msg) => set({
    forwardingMessage: msg,
    replyMessage: null,
    editingMessage: null,
    selectedForwardChats: [],
  }),
  selectedForwardChats: [],
  toggleForwardChat: (chatId) => set((state) => ({
    selectedForwardChats: state.selectedForwardChats.includes(chatId)
      ? state.selectedForwardChats.filter(id => id !== chatId)
      : [...state.selectedForwardChats, chatId]
  })),
  resetForwarding: () => set({
    forwardingMessage: null,
    selectedForwardChats: [],
    modalMode: null
  }),
}))
