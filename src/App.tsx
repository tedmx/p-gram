import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import { MainLayout } from './components/layout/MainLayout' // Добавляем импорт
import { Sidebar } from './components/layout/Sidebar'
import { MessageList } from './components/chat/MessageList'
import { MessageInput } from './components/chat/MessageInput'
import { useChatStore } from './store/chatStore'

function App() {
  useAuth() // Запускаем отслеживание сессии
  
  const { user, isLoading } = useAuthStore()
  const { activeChatId, activeChatData } = useChatStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Загрузка P-gram...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      {user ? (
        <MainLayout 
          sidebar={<Sidebar />}
        >
          {/* Правая часть: Окно чата (Контент) */}
          <div className="flex flex-col h-full">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/20">
              <div className="flex items-center gap-3">
                {/* Аватарка-заглушка (скоро оживим) */}
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold border border-sky-500/30">
                  {activeChatData?.title?.[0].toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-sm font-semibold">{activeChatData?.title || 'Чат'}</div>
                  <div className="text-[10px] text-emerald-500">в сети</div>
                </div>
              </div>
              
              <button 
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                onClick={() => import('./api/supabase').then(m => m.supabase.auth.signOut())}
              >
                Выйти из системы
              </button>
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 w-full">
              <div className="mb-4 opacity-20">
                <img src="/tg.jpg" alt="pattern" className="w-24 h-24 rounded-full grayscale" />
              </div>
              {activeChatId ? (
                <>
                  <MessageList chatId={activeChatId} />
                  <MessageInput chatId={activeChatId} />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <p className="text-sm italic">Выберите чат, чтобы начать общение</p>
                </div>
              )}
            </div>
          </div>
        </MainLayout>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App
