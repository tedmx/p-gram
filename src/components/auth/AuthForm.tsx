import { useState } from 'react'
import { supabase } from '../../api/supabase'
import { Modal } from '../ui/Modal'

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: email.split('@')[0],
            })
          if (profileError) console.error('Profile creation error:', profileError)
        }
        setShowSuccessModal(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Произошла неизвестная ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setIsSignUp(false)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          {isSignUp ? 'Создать аккаунт' : 'Вход в P-gram'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500"
            required
          />
          
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-400/10 p-2 rounded border border-red-200 dark:border-red-400/20">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 text-sm transition-colors"
        >
          {isSignUp ? 'Уже есть аккаунт? Войти' : "Нет аккаунта? Зарегистрироваться"}
        </button>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title=""
        hideTitle
        showCloseButton
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Регистрация прошла успешно!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            На указанную почту {email} отправлено письмо с подтверждением. Пожалуйста, проверьте почту и следуйте инструкциям.
          </p>
          <button
            type="button"
            onClick={handleCloseSuccessModal}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold rounded-xl transition-colors"
          >
            Отлично!
          </button>
        </div>
      </Modal>
    </div>
  )
}
