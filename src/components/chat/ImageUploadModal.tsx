import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { uploadImage } from '../../api/messages'

interface ImageUploadModalProps {
  file: File | null
  isOpen: boolean
  onClose: () => void
  onSend: (imageUrl: string, caption: string) => void
}

export const ImageUploadModal = ({ file, isOpen, onClose, onSend }: ImageUploadModalProps) => {
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Создаём превью при открытии модалки
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Очищаем URL при закрытии или смене файла
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [file])

  const handleSend = async () => {
    if (!file) return
    try {
      const imageUrl = await uploadImage(file)
      onSend(imageUrl, caption)
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error)
      alert('Не удалось загрузить изображение. Попробуйте ещё раз.')
    } finally {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" hideTitle={true} showCloseButton={true}>
      <div className="flex flex-col items-center space-y-4">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Превью" 
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        ) : (
          <p>Загрузка превью...</p>
        )}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Добавьте подпись..."
          className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl resize-none focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-slate-100"
          rows={3}
        />
        <div className="flex justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Отправить
          </button>
        </div>
      </div>
    </Modal>
  )
}