import type { ChatType, Profile, UiChat } from '../types'

/** Одна строка ответа Supabase: join participants → chats (вложенный select). */
export interface SupabaseMyChatsRow {
  chat_id: string
  is_manual_unread: boolean
  chats: SupabaseMyChatsNested | SupabaseMyChatsNested[] | null
}

export interface SupabaseMyChatsNested {
  id: string
  type: ChatType
  participants: {
    user_id: string
    /** Сырой ответ / типы клиента иногда дают один профиль или массив из одного элемента. */
    profiles: Profile | Profile[] | null
  }[]
  messages: {
    id: string
    content: string
    created_at: string
    sender_id: string
    read: boolean
  }[]
}

export function mapMyChatsRowToUiChat(
  row: SupabaseMyChatsRow,
  currentUserId: string
): UiChat | null {
  const rawChats = row.chats
  const nested =
    rawChats == null
      ? null
      : Array.isArray(rawChats)
        ? rawChats[0] ?? null
        : rawChats
  if (!nested) return null

  const participantsList = nested.participants ?? []

  const rawPartnerProfiles = participantsList.find(
    (p) => p.user_id !== currentUserId
  )?.profiles
  const partner =
    rawPartnerProfiles == null
      ? null
      : Array.isArray(rawPartnerProfiles)
        ? rawPartnerProfiles[0] ?? null
        : rawPartnerProfiles

  const participants: Profile[] = !participantsList.length
    ? []
    : participantsList
        .map((p) => {
          const raw = p.profiles
          if (raw == null) return null
          return Array.isArray(raw) ? raw[0] ?? null : raw
        })
        .filter((prof): prof is Profile => prof != null)

  const lastRaw = nested.messages?.[0]

  // Считаем непрочитанные: те, где read === false И отправитель не я
  const unreadCount = nested.messages?.filter(
    (m) => !m.read && m.sender_id !== currentUserId
  ).length ?? 0

  return {
    chat_id: row.chat_id,
    title: partner?.username ?? 'Неизвестный',
    type: nested.type,
    avatar_url: partner?.avatar_url ?? null,
    avatar_color: partner?.avatar_color ?? null,
    participants,
    lastMessage: lastRaw
      ? {
          id: lastRaw.id,
          chat_id: row.chat_id,
          sender_id: lastRaw.sender_id,
          content: lastRaw.content,
          created_at: lastRaw.created_at,
          read: lastRaw.read,
        }
      : null,
    unread_count: unreadCount,
    is_manual_unread: row.is_manual_unread ?? false,
  }
}

export function mapMyChatsRowsToUiChats(
  rows: SupabaseMyChatsRow[],
  currentUserId: string
): UiChat[] {
  return rows
    .map((row) => mapMyChatsRowToUiChat(row, currentUserId))
    .filter((c): c is UiChat => c !== null)
}
