import { useState, type ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 overflow-hidden text-slate-100">
      {/* Левая панель: Список чатов */}
      <aside className="w-80 md:w-96 border-r dark:border-slate-800 flex flex-col bg-white  dark:bg-slate-900/50">
        <header className="p-4 border-b dark:border-slate-800 flex items-center gap-3 relative">
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
              <div className="absolute left-4 top-14 z-20 min-w-[220px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5">
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

      {/* Правая часть: Окно чата */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        {children}
      </main>
    </div>
  )
}
