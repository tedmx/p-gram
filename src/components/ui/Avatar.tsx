import { AvatarFallback } from './AvatarFallback'

type AvatarProps = {
  src?: string | null
  name: string
  className?: string
  backgroundColor?: string | null
  children?: React.ReactNode
}

export const Avatar = ({ src, name, className = '', backgroundColor, children }: AvatarProps) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <AvatarFallback
      label={name}
      backgroundColor={backgroundColor}
      className={className}
    >
      {children}
    </AvatarFallback>
  )
}