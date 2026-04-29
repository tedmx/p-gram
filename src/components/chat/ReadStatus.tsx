import { type ComponentProps } from 'react'

// Одна галка — отправлено/доставлено
export const SentIcon = ({ className }: ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

// Две галки — прочитано
export const ReadIcon = ({ className }: ComponentProps<'svg'>) => {
  const offset = 8
  const standardTick = "M20 6L9 17l-5-5"
  const shortTick = "M20 6L9 17l-1.5-1.5"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 30 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 1. Левая галочка (обычная) */}
      <path d={standardTick} />

      {/* 2. Правая галочка (укороченная и смещенная) */}
      <path 
        d={shortTick} 
        transform={`translate(${offset}, 0)`} 
      />
    </svg>
  )
}
  
