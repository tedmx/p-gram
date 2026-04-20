import type { BaseEditor, DecoratedRange } from 'slate'
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
  read: boolean
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
}

/**
 * Данные открытого чата для шапки и модалок. Идентификатор хранится отдельно (activeChatId).
 */
export type UiChatActive = Omit<UiChat, 'chat_id' | 'lastMessage'>

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
