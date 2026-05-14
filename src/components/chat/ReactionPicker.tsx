import { getAppleEmojiUrl } from '../../utils/emoji'

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '😂', '😮', '😢', '💯', '🙏']

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export const ReactionPicker = ({ onSelect, onClose }: ReactionPickerProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-full transform transition-all duration-200 ease-out scale-100 opacity-100 origin-bottom">
      {COMMON_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji)
            onClose()
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-lg"
        >
          {/* Используем img вместо текста */}
          <img 
            src={getAppleEmojiUrl(emoji)} 
            alt={emoji} 
            className="w-5 h-5 object-contain"
          />
        </button>
      ))}
    </div>
  )
}
