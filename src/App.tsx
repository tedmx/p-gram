import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { MainLayout } from './components/layout/MainLayout' // Добавляем импорт
import { Sidebar } from './components/layout/Sidebar'
import { MessageList } from './components/chat/MessageList'
import { MessageInput } from './components/chat/MessageInput'
import { useChatStore } from './store/chatStore'
import { useEffect, useMemo, useState } from 'react'
import { AvatarFallback } from './components/ui/AvatarFallback'
import { EmojiText } from './components/ui/EmojiText'
import { Modal } from './components/ui/Modal'
import { useLocation, useNavigate } from 'react-router-dom'

function App() {
  useAuth() // Запускаем отслеживание сессии
  
  const { user, isLoading } = useAuthStore()
  const { activeChatId, activeChatData, setActiveChat, sidebarVisible, setSidebarVisible } = useChatStore()
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const chatPartner = useMemo(() => {
    if (!activeChatData || !user) return null
    if (activeChatData.type !== 'direct') return null
    return activeChatData.participants?.find((participant) => participant.id !== user.id) || null
  }, [activeChatData, user])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!activeChatId) return

      // First close the info modal, only then close the chat on second Escape
      if (isChatInfoOpen) {
        setIsChatInfoOpen(false)
      } else {
        setActiveChat(null)
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeChatId, isChatInfoOpen, navigate, setActiveChat])

  useEffect(() => {
    if (location.pathname === '/' && activeChatId) {
      setTimeout(() => {
        setActiveChat(null)
        setIsChatInfoOpen(false)
      })
    }
  }, [activeChatId, location.pathname, setActiveChat])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-800 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Загрузка P-gram...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center">
      {user ? (
        <MainLayout 
          sidebar={<Sidebar />}
          isChatOpen={!!activeChatId}
          sidebarVisible={sidebarVisible}
        >
          {/* Правая часть: Окно чата (Контент) */}
          <div className="flex flex-col h-full">
            {activeChatId && (
              <header className="h-16 bg-white dark:bg-slate-900 w-full flex items-center">
                {/* Back/Close button - logic depends on viewport width and sidebar state */}
                <button
                  type="button"
                  onClick={() => {
                    const isTablet = window.innerWidth >= 601 && window.innerWidth <= 925
                    
                    if (isTablet) {
                      if (sidebarVisible) {
                        // State 3 → State 1: Close chat completely
                        setActiveChat(null)
                        setIsChatInfoOpen(false)
                        navigate('/')
                      } else {
                        // State 2 → State 3: Show sidebar
                        setSidebarVisible(true)
                      }
                    } else {
                      // Mobile (<=600px): Close chat completely
                      setActiveChat(null)
                      setIsChatInfoOpen(false)
                      navigate('/')
                    }
                  }}
                  className="lg:hidden w-14 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {sidebarVisible ? (
                    // State 3: Close (X) icon
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    // State 2: Back arrow icon
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => activeChatData && setIsChatInfoOpen(true)}
                  disabled={!activeChatData}
                  className="flex-1 h-full flex items-center gap-3 px-6 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <AvatarFallback
                    label={activeChatData?.title ?? 'Чат'}
                    backgroundColor={activeChatData?.avatar_color}
                    className="w-10 h-10 border border-white/40 dark:border-sky-500/30"
                  />
                  <div className="text-left">
                    <div className="text-sm text-slate-800 dark:text-slate-100 font-semibold">
                      <EmojiText text={activeChatData?.title || 'Чат'} />
                    </div>
                    <div className="text-[10px] text-emerald-500">в сети</div>
                  </div>
                </button>
              </header>
            )}
            
            <div className="flex-1 flex flex-col relative telegram-bg-container w-full overflow-hidden bg-chat-gradient">
              {activeChatId ? (
                <>
                  {/* Контейнер для списка, чтобы он был поверх фона */}
                  <div className="flex-1 relative z-10 overflow-y-auto w-full">
                    <MessageList chatId={activeChatId} />
                  </div>
                  {/* Поле ввода тоже поверх фона */}
                  <div className="relative z-10 w-full px-5 mb-5">
                    <MessageInput chatId={activeChatId} key={activeChatId}/>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <p className="text-sm italic">Выберите чат, чтобы начать общение</p>
                </div>
              )}
            </div>
          </div>
          <Modal
            isOpen={isChatInfoOpen}
            onClose={() => setIsChatInfoOpen(false)}
            title={activeChatData?.title || 'Информация о чате'}
            hideTitle
            showCloseButton
          >
            <div className="flex flex-col items-center text-center gap-4 pt-1">
              <AvatarFallback
                label={chatPartner?.username || activeChatData?.title || '?'}
                backgroundColor={
                  chatPartner?.avatar_color ?? activeChatData?.avatar_color
                }
                className="w-20 h-20 text-3xl border border-slate-200 dark:border-sky-500/30"
              />

              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                <EmojiText text={chatPartner?.username || activeChatData?.title || 'Неизвестный'} />
              </div>

              <button
                type="button"
                onClick={() => setIsChatInfoOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Написать</span>
              </button>
            </div>
          </Modal>
        </MainLayout>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App
