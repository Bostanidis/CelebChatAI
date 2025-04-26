// components/sidebar/NewCharacterModal.jsx

import { useState, useRef } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'

export default function NewCharacterModal({ isOpen, onClose }) {
  const { canCreateCharacter } = useSubscription()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    avatar: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canCreateCharacter()) {
      // Modern toast-like notification could be implemented here
      alert('You need a Pro or Ultra subscription to create custom characters.')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Implement character creation logic with Supabase storage for avatar
      await new Promise(resolve => setTimeout(resolve, 1000))
      onClose()
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        systemPrompt: '',
        avatar: null
      })
      setPreviewUrl(null)
    } catch (error) {
      console.error('Error creating character:', error)
      alert('Failed to create character. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, avatar: file }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-8 border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl shadow-purple-500/10 dark:shadow-purple-600/20 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 dark:from-purple-600/20 dark:to-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Modal content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create New Character</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar preview and upload */}
            <div className="flex justify-center mb-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div 
                  className="relative w-24 h-24 rounded-full border-2 border-indigo-500/30 dark:border-indigo-400/40 overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Character preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-neutral-400 dark:text-neutral-500">
                      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Upload</span>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </div>

            {/* Name input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-neutral-500 dark:placeholder-neutral-400"
                placeholder="Character name"
              />
            </div>

            {/* Description input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-neutral-500 dark:placeholder-neutral-400"
                placeholder="Brief description"
              />
            </div>

            {/* System prompt input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={e => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                required
                rows={4}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-neutral-500 dark:placeholder-neutral-400"
                placeholder="Detailed instructions for the AI to roleplay this character..."
              />
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Avatar max file size: 5MB. Recommended size: 256x256px
            </p>

            {/* Form buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Character'
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}