import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/formatting'
import { Spinner } from '@/components/primitives/Spinner'

type MessageVariant = 'user' | 'bot' | 'system'

interface MessageItemProps {
  variant: MessageVariant
  content: string
  timestamp: Date
  senderName?: string
  isLoading?: boolean
}

// Minimal markdown-lite: **bold**, `code`, line breaks
function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} className="bg-neutral-100 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>
          }
          return <span key={j}>{part}</span>
        })}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export function MessageItem({ variant, content, timestamp, senderName, isLoading }: MessageItemProps) {
  if (variant === 'system') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs text-neutral-400 font-medium px-2">{content}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    )
  }

  const isBot = variant === 'bot'
  const isUser = variant === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isBot ? 'bg-primary-100 text-primary-600' : 'bg-neutral-200 text-neutral-600'
      )}>
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[85%] space-y-1', isUser && 'items-end flex flex-col')}>
        {senderName && (
          <span className="text-xs text-neutral-500 font-medium px-1">{senderName}</span>
        )}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isBot
            ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm'
            : 'bg-primary-500 text-white rounded-tr-sm'
        )}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-neutral-400 text-xs">Thinking…</span>
            </div>
          ) : (
            <>{renderContent(content)}</>
          )}
        </div>
        <span className={cn('text-xs text-neutral-400 px-1', isUser && 'text-right')}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  )
}
