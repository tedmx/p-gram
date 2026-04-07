import { AuthForm } from './components/auth/AuthForm'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'

function App() {
  useAuth() // Запускаем отслеживание сессии
  
  const { user, isLoading } = useAuthStore()

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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">С возвращением, {user.email}!</h1>
          <button 
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            onClick={() => import('./api/supabase').then(m => m.supabase.auth.signOut())}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App
