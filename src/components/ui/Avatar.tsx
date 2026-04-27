import { AvatarFallback } from './AvatarFallback'

type AvatarProps = {
  src?: string | null
  name: string
  className?: string
  backgroundColor?: string | null
}

export const Avatar = ({ src, name, className = '', backgroundColor }: AvatarProps) => {
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
    />
  )
}