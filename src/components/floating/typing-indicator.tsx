import React from 'react'

export function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center p-3 bg-muted/50 rounded-2xl rounded-tl-sm w-fit">
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
    </div>
  )
}
