// src/components/ui/GenericMenu.tsx
import type { LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'

export type MenuOption = {
  label: string
  onClick: () => void
  isDestructive?: boolean
  icon?: LucideIcon
}

type Position = { x: number; y: number }

interface GenericMenuProps {
  position: Position
  options: MenuOption[]
  onClose: () => void
  width?: number
}

export const GenericMenu = ({ 
  position, 
  options, 
  onClose,
  width = 250 
}: GenericMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Корректировка позиции, чтобы меню не вылезало за края экрана
  const adjustedX = Math.min(position.x, window.innerWidth - width - 10)
  const adjustedY = Math.min(position.y, window.innerHeight - (options.length * 40) - 20)

  return createPortal(
    <>
      {/* Overlay для закрытия кликом вне меню */}
      <div className="fixed inset-0 z-100" onClick={onClose} onContextMenu={(e) => {
        e.preventDefault()
        onClose()
      }} />
      
      <div 
        ref={menuRef}
        className={`
          fixed z-101 min-w-[${width}px] bg-white/95 text-slate-800 backdrop-blur-xl
          dark:bg-slate-800/90 dark:text-slate-200
          border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl p-1.5
          animate-in fade-in zoom-in-95 duration-100 ease-out
        `}
        style={{ top: adjustedY, left: adjustedX, width }}
      >
        {options.map((option, index) => (
          <div key={option.label}>
            <button 
              onClick={e => {
                e.stopPropagation()
                option.onClick()
                onClose()
              }}
              className={`
                w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between group transition-colors
                ${option.isDestructive 
                  ? 'hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400' 
                  : 'hover:bg-sky-100 dark:hover:bg-sky-500/20 text-slate-700 dark:text-slate-200'}
              `}
            >
              <span>{option.label}</span>
              {option.icon && (
                <option.icon 
                  size={18} 
                  strokeWidth={2} 
                  className={`opacity-60 group-hover:opacity-100 transition-opacity ${
                    option.isDestructive ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
                  }`} 
                />
              )}
            </button>
            {/* Добавляем разделитель перед деструктивными действиями, если они не первые */}
            {index < options.length - 1 && options[index + 1].isDestructive && !option.isDestructive && (
              <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-1 mx-1" />
            )}
          </div>
        ))}
      </div>
    </>,
    document.body
  )
}
