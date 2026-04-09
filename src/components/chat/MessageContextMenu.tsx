type Position = { x: number; y: number }

export const MessageContextMenu = ({ 
  position, 
  onEdit, 
  onClose 
}: { 
  position: Position
  onEdit: () => void
  onClose: () => void 
}) => {

  const menuWidth = 160
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 10)

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className={`
          fixed z-50 min-w-[160px] bg-slate-800/90 backdrop-blur-xl 
          border border-slate-700/50 rounded-xl shadow-2xl p-1.5
          origin-top-left transition-all duration-150 ease-out
          scale-100 opacity-100 animate-in fade-in zoom-in-95
        `}
        style={{ top: position.y, left: adjustedX }}
      >
        <button 
          onClick={() => { onEdit(); onClose() }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-sky-500/20 text-slate-200 rounded-lg flex items-center justify-between group transition-colors"
        >
          <span>Редактировать</span>
          <span className="opacity-40 group-hover:opacity-100">✏️</span>
        </button>
        
        <div className="h-px bg-slate-700/50 my-1 mx-1" />
        
        <button 
          className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-between group transition-colors"
        >
          <span>Удалить</span>
          <span className="opacity-40 group-hover:opacity-100">🗑️</span>
        </button>
      </div>
    </>
  )
}