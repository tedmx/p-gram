export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Считаем разницу в миллисекундах
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  // 1. Если прошло меньше 24 часов (показываем время)
  // Важно: проверяем именно календарный день, чтобы в 00:01 "вчера" уже работало
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  // 2. Если прошло больше 24 часов, но меньше 7 дней (день недели)
  if (diffInDays < 7) {
    const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' })
    // Убираем точку, если она есть (в некоторых локалях "пн."), и приводим к нижнему регистру
    return weekday.replace('.', '').toLowerCase()
  }

  // 3. Если старше недели (число и месяц)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  }).replace('.', '') // Убираем точку после месяца
}
