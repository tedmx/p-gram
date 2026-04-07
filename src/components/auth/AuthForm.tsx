import { useState } from 'react'
import { supabase } from '../../api/supabase'

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

    } catch (err) {
      // Проверяем, является ли ошибка объектом с сообщением
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Произошла неизвестная ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isSignUp ? 'Создать аккаунт' : 'Вход в P-gram'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          required
        />
        
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">
            {error}
          </p>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? 'Processing...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        {isSignUp ? 'Уже есть аккаунт? Войти' : "Нет аккаунта? Зарегистрироваться"}
      </button>
    </div>
  )
}
