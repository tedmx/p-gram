import { useState, useRef, useCallback, type ReactNode, useEffect } from 'react'
import { UserMenu } from './UserMenu'

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
  const [sidebarWidth, setSidebarWidth] = useState(499)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(499)

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
          <UserMenu /> {/* Используем компактный компонент */}
          <h1 className="text-xl font-bold text-sky-400">P-gram</h1>
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
