export const getAppleEmojiUrl = (emoji: string) => {
  const hexCode = [...emoji]
    .map((char) => char.codePointAt(0)!.toString(16))
    .filter((hex) => hex !== 'fe0f')
    .join('-')

  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hexCode}.png`
}
