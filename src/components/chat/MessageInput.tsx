import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'

export const MessageInput = ({ chatId }: { chatId: string }) => {
  const [text, setText] = useState('')
  const currentUser = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => sendMessage(chatId, currentUser!.id, text),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() && !isPending) mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Написать сообщение..."
        className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-sky-500 transition-all"
      />
      <button 
        type="submit" 
        disabled={!text.trim() || isPending}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl font-medium transition-colors disabled:opacity-50"
      >
        Отправить
      </button>
    </form>
  )
}