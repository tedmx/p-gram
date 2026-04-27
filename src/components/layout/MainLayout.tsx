import { useState, useRef, useCallback, type ReactNode, useEffect } from 'react'
import { useChatStore } from '../../store/chatStore'

interface MainLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  isChatOpen?: boolean
  sidebarVisible?: boolean
  onMyProfileClick?: () => void
}

export const MainLayout = ({ 
  children, 
  sidebar, 
  isChatOpen = false,
  sidebarVisible = false,
}: MainLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(499)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(499)
  const openModal = useChatStore(state => state.openModal)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = sidebarWidth
  }, [sidebarWidth])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    const diff = e.clientX - startXRef.current
    const newWidth = startWidthRef.current + diff
    
    const minWidth = 256
    const maxWidth = Math.floor(window.innerWidth * 0.4)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth)
      if (containerRef.current) {
        containerRef.current.style.setProperty('--dynamic-sidebar-width', `${newWidth}px`)
      }
    }
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--dynamic-sidebar-width', `${sidebarWidth}px`)
    }
  }, [sidebarWidth])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div 
      ref={containerRef}
      className={`telegram-layout-container ${isResizing ? 'is-resizing' : ''} ${isChatOpen ? 'chat-open' : ''} ${sidebarVisible ? 'sidebar-visible' : ''}`}
    >
      {/* Левая панель: Список чатов */}
      <aside className="telegram-left-column bg-white dark:bg-slate-900/50 border-r dark:border-slate-800 flex flex-col overflow-hidden border-gray-200">
        <header className="p-4 flex items-center gap-3 relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Открыть меню"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-sky-400">P-gram</h1>

          {isMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute left-4 top-14 z-20 min-w-55 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    openModal('my-profile')
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Мой профиль
                </button>

                {/* Разделитель */}
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    import('../../api/supabase').then((m) => m.supabase.auth.signOut())
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-700 dark:text-slate-200 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Выйти из системы
                </button>
              </div>
            </>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Правая часть: Окно чата - с resizer внутри */}
      <main className="telegram-main-column flex flex-col relative bg-slate-950 overflow-hidden">
        {/* Resize handle - positioned at LEFT edge of chat window, inside main */}
        <div 
          className="telegram-resize-handle"
          onMouseDown={handleMouseDown}
        />
        {children}
      </main>
    </div>
  )
}
