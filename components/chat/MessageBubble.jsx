// components/chat/MessageBubble.jsx
import Image from 'next/image'
import { useState } from 'react'

export default function MessageBubble({ message, character }) {
  const [isHovered, setIsHovered] = useState(false)
  const isAI = message.role === 'assistant'

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[80%] items-start gap-3 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAI && character?.avatar_url && (
          <div className="flex-shrink-0 w-10 h-10 relative">
            <img
              src={character.avatar_url}
              alt={character.name}
              className="w-full h-full object-cover rounded-full object-top"
            />
          </div>
        )}
        <div 
          className={`
            p-4 rounded-2xl
            ${isAI 
              ? 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700' 
              : 'bg-primary border border-primary/80'
            }
            ${isHovered ? 'scale-[1.02]' : ''}
            transition-all duration-200
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p className={`whitespace-pre-wrap text-sm ${isAI ? 'text-neutral-800 dark:text-neutral-50' : '!text-white'}`}>
            {message.content}
          </p>
        </div>
      </div>
    </div>
  )
}