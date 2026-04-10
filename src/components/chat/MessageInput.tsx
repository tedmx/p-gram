import { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import { createEditor, type Descendant, Node, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage, updateMessage } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'

// Выносим константу, чтобы она была доступна компоненту
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

export const MessageInput = ({ chatId }: { chatId: string }) => {
  const currentUser = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const editor = useMemo(() => withReact(createEditor()), [])

  const [value, setValue] = useState<Descendant[]>(initialValue)
  const [draftValue, setDraftValue] = useState<Descendant[]>(initialValue)

  const { editingMessage, setEditingMessage } = useChatStore()

  const lastSyncedId = useRef<string | null>(null)

  const { mutate: handleSend, isPending } = useMutation({
    mutationFn: (content: string) => sendMessage(chatId, currentUser!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  const { mutate: handleUpdate } = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) => 
      updateMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['my-chats'] })
    }
  })

  // Когда начинаем редактировать — закидываем текст в редактор
  useEffect(() => {
    if (editingMessage && lastSyncedId.current !== editingMessage.id) {
      lastSyncedId.current = editingMessage.id
      // eslint-disable-next-line react-hooks/immutability
      editor.children = [{
        type: 'paragraph',
        children: [{ text: editingMessage.content }]
      }]
      editor.onChange()
      Transforms.select(editor, editor.end([]))
    }
    
    // Если режим редактирования закрыт, сбрасываем ID последней синхронизации
    if (!editingMessage) {
      lastSyncedId.current = null
      editor.children = draftValue
      editor.onChange()
      Transforms.select(editor, editor.end([]))
    }
  }, [draftValue, editingMessage, editor, setDraftValue, value])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSendMessage()
    }
  }

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onSendMessage = useCallback(() => {
    const content = value.map(n => Node.string(n)).join('\n').trim()

    if (content) {
      if (editingMessage) {
        handleUpdate({ id: editingMessage.id, content })
        setEditingMessage(null)
      } else {
        handleSend(content)
      }

      setDraftValue(initialValue)
      lastSyncedId.current = null

      Transforms.delete(editor, {
        at: { anchor: editor.start([]), focus: editor.end([]) }
      })
    }
  }, [
    value,
    editor,
    editingMessage,
    setEditingMessage,
    handleUpdate,
    handleSend,
  ])

  return (
    <div className="mx-auto flex flex-col w-full max-w-[45.5rem] [@media(min-width:1921px)]:max-w-[50vw] bg-white dark:bg-slate-800 rounded-2xl ">
      {editingMessage && (
        <div className="flex items-center gap-3 px-6 py-2 bg-slate-800/50 border-b border-slate-700/50 animate-in slide-in-from-bottom-2">
          <div className="text-sky-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 border-l-2 border-sky-500 pl-3">
            <div className="text-[12px] font-bold text-sky-500 leading-tight">Редактирование сообщения</div>
            <div className="text-sm text-slate-400 truncate">{editingMessage.content}</div>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null)
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 px-6 py-3">
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={(newValue) => {
            setValue(newValue)

            const isAstChange = editor.operations.some(op => op.type === 'set_selection')
            if (!editingMessage && !isAstChange) {
              setDraftValue(newValue)
            }
          }}
        >
          <Editable
            placeholder="Напишите сообщение..."
            className="flex-1 max-h-60 overflow-y-auto outline-none py-1 text-sm text-slate-900 dark:text-slate-200"
            onKeyDown={handleKeyDown}
          />
        </Slate>
        <button 
          onClick={onSendMessage} // Меняем на вызов функции напрямую
          disabled={isPending}
          className="p-2 text-sky-500 hover:text-sky-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}