import type { BaseEditor, DecoratedRange } from 'slate'
import { ReactEditor } from 'slate-react'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  avatar_color: string | null
  bio?: string        // Краткая биография
  birthday?: string   // День рождения
}

export interface MessageReaction {
  emoji: string
  user_id: string
  profiles?: {
    username: string | null
    avatar_url: string | null
    avatar_color: string | null
  } | null
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
  reply_to_id?: string | null
  is_sending?: boolean
  forwarded_from_id?: string | null
  reactions?: MessageReaction[] 
}

export type ChatType = 'direct' | 'group' | 'channel'

export interface Chat {
  id: string
  type: 'direct' | 'group'
  created_at: string
  participants: Profile[]
}

/**
 * Нормализованный чат для UI (список в сайдбаре и т.п.).
 * Совпадает с тем, что отдаёт клиентский слой после маппинга ответа API.
 */
export interface UiChat {
  chat_id: string
  title: string
  type: ChatType
  avatar_url: string | null
  avatar_color: string | null
  /** Есть при загрузке с сервера; может отсутствовать сразу после создания direct из поиска. */
  participants?: Profile[]
  lastMessage: Message | null
  unread_count: number
  is_manual_unread: boolean
}

/**
 * Данные открытого чата для шапки и модалок. Идентификатор хранится отдельно (activeChatId).
 */
export type UiChatActive = Omit<UiChat, 'chat_id' | 'lastMessage' | 'unread_count'> & {
  unread_count?: number
}

export type CustomElement = { type: 'paragraph'; children: CustomText[] }

export type CustomText = {
  text: string;
  emoji?: boolean;
  emojiChar?: string;
}

export type CustomDecoratedRange = DecoratedRange & {
  emoji?: boolean;
  emojiChar?: string;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
    DecoratedRange: CustomDecoratedRange
  }
}

export interface SingleEmojiData {
  id: string;
  native: string;
  name: string;
}

export type ModalMode = 'chat-info' | 'my-profile' | 'forward' | null
