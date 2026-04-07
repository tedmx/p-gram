import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Левая панель: Список чатов */}
      <aside className="w-80 md:w-96 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <header className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-sky-400">P-gram</h1>
          {/* Здесь позже будет поиск или меню */}
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
