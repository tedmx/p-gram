import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../../store/chatStore'
import { Avatar } from '../ui/Avatar'
import { EmojiText } from '../ui/EmojiText'

export const ChatHeader = () => {
  const navigate = useNavigate()
  const { 
    activeChatId, 
    activeChatData, 
    setActiveChat, 
    sidebarVisible, 
    setSidebarVisible,
    openModal 
  } = useChatStore()

  if (!activeChatId) return null

  const handleBackClick = () => {
    const isTablet = window.innerWidth >= 601 && window.innerWidth <= 925
    
    if (isTablet) {
      if (sidebarVisible) {
        setActiveChat(null)
        navigate('/')
      } else {
        setSidebarVisible(true)
      }
    } else {
      setActiveChat(null)
      navigate('/')
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 w-full flex items-center shrink-0 border-b dark:border-slate-800">
      {/* Кнопка назад (Mobile/Tablet) */}
      <button
        type="button"
        onClick={handleBackClick}
        className="lg:hidden w-14 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {sidebarVisible ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      {/* Информация о чате */}
      <button
        type="button"
        onClick={() => openModal('chat-info')}
        disabled={!activeChatData}
        className="flex-1 h-full flex items-center gap-3 px-6 text-left transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/40 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Avatar
          src={activeChatData?.avatar_url} 
          name={activeChatData?.title || '?'} 
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
  )
}
