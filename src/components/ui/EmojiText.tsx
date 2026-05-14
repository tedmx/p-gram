import emojiRegex from 'emoji-regex'
import { getAppleEmojiUrl } from '../../utils/emoji'

interface EmojiTextProps {
  text: string
  className?: string
}

/**
 * Превращает Unicode-эмодзи в теги <img> с изображениями в стиле Apple.
 */
export const EmojiText = ({ text, className = '' }: EmojiTextProps) => {
  const regex = emojiRegex()
  const parts = []
  let lastIndex = 0
  let match

  // Находим все эмодзи в тексте
  while ((match = regex.exec(text)) !== null) {
    const emoji = match[0]
    const index = match.index

    // Добавляем текст до эмодзи
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index))
    }

    // Превращаем эмодзи в Hex-код для ссылки
    // Важно: убираем селектор вариации fe0f, так как его обычно нет в названиях файлов
    const hexCode = [...emoji]
      .map((char) => char.codePointAt(0)!.toString(16))
      .filter((hex) => hex !== 'fe0f')
      .join('-')

    const emojiUrl = getAppleEmojiUrl(emoji)

    parts.push(
      <img
        key={`${index}-${hexCode}`}
        src={emojiUrl}
        alt={emoji}
        className="inline-block w-[1.25em] h-[1.25em] align-[-0.2em] mx-[0.05em]"
        draggable={false}
      />
    )

    lastIndex = regex.lastIndex
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <span className={className}>{parts}</span>
}
