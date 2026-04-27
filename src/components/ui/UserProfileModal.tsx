// src/components/ui/UserProfileModal.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { updateProfile } from '../../api/users'
import { useAuthStore } from '../../store/authStore'
import type { Profile } from '../../types'
import { EmojiText } from './EmojiText'
import { Modal } from './Modal'

import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage'
import { Avatar } from './Avatar' // Используем новый компонент
import { supabase } from '../../api/supabase' // Для прямого доступа к Storage

interface UserProfileModalProps {
  onClose: () => void
  user: Profile | null | undefined // Пользователь, профиль которого смотрим (может быть текущим или chatPartner)
  isMyProfile?: boolean // Флаг, что это профиль текущего пользователя (влияет на возможность редактирования)
}

export const UserProfileModal = ({ onClose, user, isMyProfile = false }: UserProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  
  // Для обновления стора после сохранения
  const currentUser = useAuthStore(state => state.user)
  const setCurrentUser = useAuthStore(state => state.setUser)
  
  // Состояния для кроппера
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const [isUploading, setIsUploading] = useState(false)

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('User not found')
      return updateProfile(user.id, updates)
    },
    onSuccess: (updatedProfile) => {
      // Если редактируем свой профиль - обновляем стор
      if (isMyProfile && currentUser) {
        const newUserState = { ...currentUser, ...updatedProfile }
        setCurrentUser(newUserState)
      }
  
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      setIsEditing(false)
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
      alert('Не удалось сохранить изменения')
    },
  })

  const handleSave = () => {
    const bioValue = (document.getElementById('edit-bio') as HTMLTextAreaElement)?.value
    const birthdayValue = (document.getElementById('edit-birthday') as HTMLInputElement)?.value

    const updates: Partial<Profile> = {
      bio: bioValue,
      birthday: birthdayValue || undefined,
    }

    updateProfileMutation.mutate(updates)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => setImageToCrop(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // 2. Логика загрузки
  const handleUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user?.id) return
    
    try {
      setIsUploading(true)
      const blob = await getCroppedImg(imageToCrop, croppedAreaPixels)
      const fileName = `${user.id}/${Date.now()}.webp`
      
      // Загружаем в бакет 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/webp', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      // Обновляем профиль (твоя существующая мутация)
      updateProfileMutation.mutate({ avatar_url: publicUrl })
      setImageToCrop(null)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // 3. Логика удаления
  const handleDeletePhoto = () => {
    if (window.confirm('Удалить фото профиля?')) {
      updateProfileMutation.mutate({ avatar_url: null })
    }
  }

  if (!user) return null

  return (
    <Modal
      isOpen
      onClose={onClose}
      title=""
      hideTitle
      showCloseButton
    >
      <div className="flex flex-col items-center text-center gap-4 pt-1">
        {isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Назад к просмотру"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Кнопка редактирования (только для своего профиля и не в режиме правки) */}
        {isMyProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-3 right-11 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Редактировать профиль"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {imageToCrop && (
          <div className="fixed inset-0 z-100 bg-slate-950/95 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-square">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setImageToCrop(null)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">
                Отмена
              </button>
              <button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="bg-sky-500 hover:bg-sky-600 px-8 py-2 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Применить'}
              </button>
            </div>
          </div>
        )}

        <div className="relative group">
          <Avatar 
            src={user?.avatar_url} 
            name={user?.username || '?'} 
            backgroundColor={user?.avatar_color}
            className="w-32 h-32 text-4xl shadow-xl"
          />
          
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer p-2 text-white hover:text-sky-400 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              {user?.avatar_url && (
                <button onClick={handleDeletePhoto} className="p-2 text-white hover:text-red-400 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          /* ФОРМА РЕДАКТИРОВАНИЯ */
          <div className="w-full space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-sky-500 uppercase px-1">О себе</label>
              <textarea
                defaultValue={user.bio}
                className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 min-h-25 resize-none"
                id="edit-bio"
                placeholder="Расскажите о себе..."
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-sky-500 uppercase px-1">День рождения</label>
              <input
                type="date"
                defaultValue={user.birthday}
                className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                id="edit-birthday"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        ) : (
          /* РЕЖИМ ПРОСМОТРА */
          <div className="w-full space-y-4">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              <EmojiText text={user.username || 'Неизвестный'} />
            </div>

            <div className="w-full space-y-4 mt-2">
              {user.bio && (
                <div className="bg-slate-100 dark:bg-slate-800/40 p-4 rounded-2xl w-full text-left">
                  <h4 className="text-[11px] font-bold text-sky-500 uppercase tracking-wider mb-1">О себе</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed wrap-break-word">
                    {user.bio}
                  </p>
                </div>
              )}

              {user.birthday && (
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-2xl w-full">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 shrink-0">
                    <span className="text-xl">🎂</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="text-[11px] font-bold text-sky-500 uppercase tracking-wider">
                      День рождения
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {new Date(user.birthday).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {!isMyProfile && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors w-full"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Написать сообщение</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
