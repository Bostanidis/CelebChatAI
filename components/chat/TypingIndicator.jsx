import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 w-fit">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce"></span>
      </div>
    </div>
  )
} 