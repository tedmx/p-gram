import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  hideTitle?: boolean
  showCloseButton?: boolean
}

export const Modal = ({ isOpen, onClose, title, children, hideTitle = false, showCloseButton = false }: ModalProps) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Оверлей */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Контент модалки */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть модалку"
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="p-6">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>}
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
