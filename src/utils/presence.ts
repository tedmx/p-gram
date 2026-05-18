export const formatLastSeen = (lastSeenISO: string | null | undefined): string => {
  if (!lastSeenISO) return 'был(а) давно'

  const lastSeen = new Date(lastSeenISO)
  const now = new Date()
  const diffInMs = now.getTime() - lastSeen.getTime()
  
  const diffInHours = diffInMs / (1000 * 60 * 60)

  // Если разница меньше 1 минуты — считаем, что пользователь прямо сейчас онлайн
  if (diffInMs < 60000) {
    return 'в сети'
  }

  // Меньше 3 часов
  if (diffInHours <= 3) {
    return 'был(а) недавно'
  }

  // Больше 3 часов
  return 'был(а) давно'
}
