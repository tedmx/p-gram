import type { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  avatar_color: string | null
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Chat {
  id: string
  type: 'direct' | 'group'
  created_at: string
  participants: Profile[]
}

// Тип для отображения в списке чатов (уже нормализованный)
export interface ChatPreview {
  chat_id: string
  title: string
  type: 'direct' | 'group' | 'channel'
  avatar_url: string | null
  avatar_color?: string | null
  participants?: Profile[]
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  } | null
}

export type CustomElement = { type: 'paragraph'; children: CustomText[] }
export type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}
