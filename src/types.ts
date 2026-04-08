export interface ChatParticipant {
  user_id: string
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export interface MyChat {
  chat_id: string
  title: string
  type: 'direct' | 'group'
  avatar_url: string | null
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  } | null
}
