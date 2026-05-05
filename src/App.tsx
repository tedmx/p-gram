import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { MainLayout } from './components/layout/MainLayout' // Добавляем импорт
import { Sidebar } from './components/layout/Sidebar'
import { MessageList } from './components/chat/MessageList'
import { MessageInput } from './components/chat/MessageInput'
import { useChatStore } from './store/chatStore'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserProfileModal } from './components/ui/UserProfileModal'
import { useProfile } from './hooks/useProfile'
import { ChatHeader } from './components/chat/ChatHeader'
import { ForwardModal } from './components/chat/ForwardModal'

function App() {
  useAuth() // Запускаем отслеживание сессии
  
  const { user, isLoading } = useAuthStore()
  const { data: currentProfile, isLoading: profileLoading } = useProfile()

  const { activeChatId, activeChatData, setActiveChat, sidebarVisible } = useChatStore()
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const modalMode = useChatStore(state => state.modalMode)
  const closeModal = useChatStore(state => state.closeModal)

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

  if (isLoading || profileLoading ) {
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
            <ChatHeader />
            
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

          {modalMode === 'my-profile' && currentProfile && (
            <UserProfileModal
              onClose={closeModal}
              user={currentProfile }
              isMyProfile={true}
            />
          )}
          {modalMode === 'chat-info' && (
            <UserProfileModal
              onClose={closeModal}
              user={chatPartner}
              isMyProfile={false}
            />
          )}
          {modalMode === 'forward' && <ForwardModal />}
        </MainLayout>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App
