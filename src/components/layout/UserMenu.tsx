import { useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { supabase } from '../../api/supabase'

export const UserMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const openModal = useChatStore(state => state.openModal)

  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Открыть меню"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      {isMenuOpen && (
        <>
          {/* Overlay для закрытия при клике вне меню */}
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={closeMenu}
            className="fixed inset-0 z-10"
          />
          
          <div className="absolute left-0 top-12 z-20 min-w-55 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 animate-in fade-in zoom-in duration-150 origin-top-left">
            <button
              type="button"
              onClick={() => {
                closeMenu()
                openModal('my-profile')
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Мой профиль
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

            <button
              type="button"
              onClick={() => {
                closeMenu()
                supabase.auth.signOut()
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-700 dark:text-slate-200 hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Выйти из системы
            </button>
          </div>
        </>
      )}
    </div>
  )
}
