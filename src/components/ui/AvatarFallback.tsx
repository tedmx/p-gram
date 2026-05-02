const DEFAULT_AVATAR_COLOR = '#8ECAE6'

type AvatarFallbackProps = {
  /** Строка, из которой берётся первая буква (имя, username и т.д.). */
  label: string
  backgroundColor?: string | null
  className?: string
  children?: React.ReactNode
}

export const AvatarFallback = ({
  label,
  backgroundColor,
  className = '',
  children,
}: AvatarFallbackProps) => {
  const initial = label.trim()[0]?.toUpperCase() ?? '?'
  const bg = backgroundColor || DEFAULT_AVATAR_COLOR

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${className}`}
      style={{ 
        backgroundColor: bg,
        backgroundImage: `linear-gradient(white -100%, ${bg})`
      }}
    >
      {children || initial}
    </div>
  )
}
