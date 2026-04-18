import { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import { createEditor, type Descendant, Node, Transforms, Text, Range, Editor } from 'slate'
import { Slate, Editable, withReact, type RenderLeafProps, ReactEditor } from 'slate-react'
import emojiRegex from 'emoji-regex'
import Picker from '@emoji-mart/react'
import { Paperclip } from 'lucide-react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMessage, updateMessage } from '../../api/messages'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { EmojiText } from '../ui/EmojiText'
import { ImageUploadModal } from './ImageUploadModal'

// Вспомогательная функция для поиска эмодзи
const searchEmojis = async (query: string) => {
  const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')
  const emojiData = await response.json()
  const emojis = emojiData.emojis
  const results = []
  const lowercaseQuery = query.toLowerCase()

  for (const id in emojis) {
    const emoji = emojis[id]
    if (
      id.toLowerCase().includes(lowercaseQuery) ||
      emoji.name.toLowerCase().includes(lowercaseQuery) ||
      (emoji.keywords && emoji.keywords.some((k: string) => k.toLowerCase().includes(lowercaseQuery)))
    ) {
      results.push({
        id,
        native: emoji.skins[0].native,
        name: emoji.name
      })
    }
    if (results.length >= 10) break
  }
  return results
}

// Выносим константу, чтобы она была доступна компоненту
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if ((leaf as any).emoji) {
    return (
      <span {...attributes} className="relative inline-block">
        <EmojiText text={(leaf as any).emojiChar} />
        {/* Делаем оригинальный текст невидимым, но доступным для Slate */}
        <span className="absolute inset-0 opacity-0 pointer-events-none select-all overflow-hidden whitespace-nowrap">
          {children}
        </span>
      </span>
    )
  }

  return <span {...attributes}>{children}</span>
}

export const MessageInput = ({ chatId }: { chatId: string }) => {
  const currentUser = useAuthStore(state => state.user)
  const queryClient = useQueryClient()
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useMemo(() => withReact(createEditor()), [])

  const [draftValue, setDraftValue] = useState<Descendant[]>(initialValue)
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const [target, setTarget] = useState<Range | null>(null)
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const hoverTimeoutRef = useRef<any>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { editingMessage, setEditingMessage } = useChatStore()

  const lastSyncedId = useRef<string | null>(null)

  // Эффект для поиска эмодзи
  useEffect(() => {
    if (search) {
      searchEmojis(search).then(results => {
        setSuggestions(results || [])
        setIndex(0)
      })
    } else {
      setSuggestions([])
    }
  }, [search])

  const handleEmojiSelect = (emoji: any) => {
    if (target) {
      Transforms.select(editor, target)
      Transforms.insertText(editor, emoji.native)
      setTarget(null)
      setSearch('')
      setSuggestions([])
    } else {
      Transforms.insertText(editor, emoji.native)
    }
    
    // Возвращаем фокус в редактор после выбора эмодзи более надежным способом
    setTimeout(() => {
      ReactEditor.focus(editor)
      // Перемещаем курсор в конец вставленного текста, если фокус потерялся
      if (editor.selection) {
        Transforms.select(editor, editor.selection)
      }
    }, 10)
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPickerVisible(true)
    }, 150) // Небольшая задержка, как в Telegram
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPickerVisible(false)
    }, 300)
  }

  const decorate = useCallback(
    ([node, path]: any) => {
      const ranges: any[] = []

      if (Text.isText(node)) {
        const { text } = node
        let match
        const localRegex = emojiRegex() // Создаем локальную копию для каждого вызова
        while ((match = localRegex.exec(text)) !== null) {
          ranges.push({
            anchor: { path, offset: match.index },
            focus: { path, offset: match.index + match[0].length },
            emoji: true,
            emojiChar: match[0],
          })
        }
      }

      return ranges
    },
    []
  )

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />
  }, [])

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
  }, [draftValue, editingMessage, editor, setDraftValue])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (target && suggestions.length > 0) {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          setIndex(prev => (prev + 1) % suggestions.length)
          return
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          setIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
          return
        case 'Tab':
        case 'Enter':
          event.preventDefault()
          handleEmojiSelect(suggestions[index])
          return
        case 'Escape':
          event.preventDefault()
          setTarget(null)
          setSearch('')
          setSuggestions([])
          return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSendMessage()
    }
  }

  const onSendMessage = useCallback(() => {
    const content = draftValue.map(n => Node.string(n)).join('\n').trim()

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
    editor,
    draftValue,
    editingMessage,
    setEditingMessage,
    handleUpdate,
    handleSend,
  ])

  const onSlateChange = (value: Descendant[]) => {
    setDraftValue(value)

    const { selection } = editor
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection)
      
      // Ищем текст до курсора в текущем блоке
      const lineBefore = Editor.before(editor, start, { unit: 'line' })
      const lineRange = lineBefore && Editor.range(editor, lineBefore, start)
      const beforeText = lineRange ? Editor.string(editor, lineRange) : Editor.string(editor, { anchor: { path: start.path, offset: 0 }, focus: start })
      
      // Проверка на автоматическую замену при закрывающем двоеточии :dog:
      const autoReplaceMatch = beforeText.match(/:(\w+):$/)
      if (autoReplaceMatch) {
        const emojiKeyword = autoReplaceMatch[1]
        searchEmojis(emojiKeyword).then(results => {
          if (results && results.length > 0) {
            const fullMatch = autoReplaceMatch[0]
            const colonOffset = start.offset - fullMatch.length
            const replaceRange = {
              anchor: { path: start.path, offset: colonOffset },
              focus: start
            }
            Transforms.select(editor, replaceRange)
            Transforms.insertText(editor, results[0].native)
            setTarget(null)
          }
        })
        return
      }

      // Проверка на открытие попапа подсказок :dog
      const colonMatch = beforeText.match(/:(\w+)$/)

      if (colonMatch) {
        const fullMatch = colonMatch[0]
        const emojiKeyword = colonMatch[1]
        
        const colonOffset = start.offset - fullMatch.length
        const newTarget = {
          anchor: { path: start.path, offset: colonOffset },
          focus: start
        }

        setTarget(newTarget)
        setSearch(emojiKeyword)
        return
      }
    }

    setTarget(null)
    setSearch('') 
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsModalOpen(true)
    }
    // Сбросить значение инпута, чтобы можно было выбрать тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto flex flex-col w-full max-w-[45.5rem] [@media(min-width:1921px)]:max-w-[50vw] bg-white dark:bg-slate-800 rounded-2xl relative">
      {target && suggestions.length > 0 && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 h-14"
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.slice(0, 10).map((emoji, i) => (
            <div
              key={emoji.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleEmojiSelect(emoji)}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                i === index ? 'bg-sky-500/20 ring-1 ring-sky-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <EmojiText text={emoji.native} className="text-2xl" />
            </div>
          ))}
        </div>
      )}
      {isPickerVisible && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Picker 
            key="apple-emoji-picker"
            set="apple"
            onEmojiSelect={handleEmojiSelect}
            locale="ru"
          />
        </div>
      )}
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
        <div 
          className="relative flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            type="button"
            className="text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9h.01M15 9h.01" />
            </svg>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="image-upload"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="image-upload" className="cursor-pointer text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 transition-colors">
          <Paperclip className="w-6 h-6" />
        </label>
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={onSlateChange}
        >
          <Editable
            placeholder="Напишите сообщение..."
            className="flex-1 max-h-60 overflow-y-auto outline-none py-1 text-sm text-slate-900 dark:text-slate-200"
            onKeyDown={handleKeyDown}
            decorate={decorate}
            renderLeaf={renderLeaf}
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
      <ImageUploadModal
        file={selectedFile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={async (imageUrl, caption) => {
          try {
            await sendMessage(chatId, currentUser!.id, caption, imageUrl);
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
            queryClient.invalidateQueries({ queryKey: ['my-chats'] });
          } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
          } finally {
            setIsModalOpen(false);
            setSelectedFile(null);
          }
        }}
      />
    </div>
  );
}
