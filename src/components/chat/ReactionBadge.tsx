import type { MessageReaction } from '../../types'
import { Avatar } from '../ui/Avatar'
import { getAppleEmojiUrl } from '../../utils/emoji'

interface ReactionBadgeProps {
  reactions: MessageReaction[]
  currentUserId?: string
  onToggle: (emoji: string) => void
}

interface GroupedReaction {
  emoji: string
  count: number
  hasMyReaction: boolean
  firstReactionData?: MessageReaction
}

export const ReactionBadge = ({ reactions, currentUserId, onToggle }: ReactionBadgeProps) => {
  if (!reactions || reactions.length === 0) return null

  // Группируем реакции по эмодзи
  const grouped = reactions.reduce((acc, curr) => {
    let group = acc.find(g => g.emoji === curr.emoji)
    
    if (!group) {
      group = {
        emoji: curr.emoji,
        count: 0,
        hasMyReaction: false,
        firstReactionData: curr // Сохраняем данные первой реакции для аватара
      }
      acc.push(group)
    }

    group.count++
    if (curr.user_id === currentUserId) {
      group.hasMyReaction = true
    }

    return acc
  }, [] as GroupedReaction[])

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 select-none">
      {grouped.map(({ emoji, count, hasMyReaction, firstReactionData }) => {
        const profile = firstReactionData?.profiles

        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`
              flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium 
              border transition-all active:scale-95 h-6
              ${hasMyReaction
                ? 'bg-sky-100 border-sky-300 text-sky-700 dark:bg-sky-950/40 dark:border-sky-500/30 dark:text-sky-300'
                : 'bg-sky-50/60 border-sky-100 text-slate-700 hover:bg-sky-100/80 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-700/50'}
            `}
          >
            {/* Эмодзи */}
            <img 
              src={getAppleEmojiUrl(emoji)} 
              alt={emoji} 
              className="w-4 h-4 object-contain" // Размер чуть меньше, чем в тексте, для аккуратности капсулы
            />

            {/* Блок индикации (Аватар или Число) */}
            {count === 1 ? (
              <Avatar
                src={profile?.avatar_url}
                name={profile?.username || '?'}
                backgroundColor={profile?.avatar_color || 'rgb(148 163 184)'}
                className="w-4 h-4 text-[8px] border-0"
              />
            ) : (
              <span className={`text-[10px] font-bold leading-none ${hasMyReaction ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
