import { useState, useRef, useEffect } from 'react'
import { Send, Wand2, MessageSquareDashed } from 'lucide-react'
import { Button } from '@/components/primitives/Button'
import { MessageItem } from '@/components/domain/MessageItem'
import { analyzeConsensus } from '@/services/api/live-chat'
import { formatLlmError } from '@/services/api/llmClient'
import { track } from '@/lib/telemetry'
import type { ConsensusInsight } from '@/types'
import { cn } from '@/lib/cn'

interface ChatMessage {
  id: string
  variant: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  senderName?: string
  isLoading?: boolean
}

export function LiveChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-1',
      variant: 'system',
      content: 'Dev / Experimental Mode',
      timestamp: new Date(),
    },
    {
      id: 'bot-welcome',
      variant: 'bot',
      content: 'Hi! Paste your group chat thread below or click **"What do you think?"** to analyze the current session context. This is a dev-only preview of the Live Chat feature.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [insight, setInsight] = useState<ConsensusInsight | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID() }])
  }

  const sendMessage = async () => {
    if (!input.trim() || thinking) return
    const userInput = input.trim()
    setInput('')

    addMessage({ variant: 'user', content: userInput, timestamp: new Date(), senderName: 'You' })

    setThinking(true)
    const loadingId = crypto.randomUUID()
    setMessages(prev => [...prev, {
      id: loadingId,
      variant: 'bot',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    }])

    try {
      const result = await analyzeConsensus([userInput])
      setMessages(prev => prev.filter(m => m.id !== loadingId))
      addMessage({
        variant: 'bot',
        content: result.nextStep,
        timestamp: new Date(),
      })
      if (result.consensusPoints.length || result.conflicts.length) {
        setInsight(result)
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== loadingId))
      addMessage({ variant: 'bot', content: formatLlmError(err), timestamp: new Date() })
    } finally {
      setThinking(false)
    }
  }

  const handleAnalyze = async () => {
    addMessage({ variant: 'user', content: 'What do you think about the current discussion?', timestamp: new Date(), senderName: 'You' })
    track.liveChatAnalysisTriggered()

    setThinking(true)
    const loadingId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: loadingId, variant: 'bot', content: '', timestamp: new Date(), isLoading: true }])

    try {
      const result = await analyzeConsensus([])
      setMessages(prev => prev.filter(m => m.id !== loadingId))
      addMessage({ variant: 'bot', content: result.nextStep, timestamp: new Date() })
      setInsight(result)
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== loadingId))
      addMessage({ variant: 'bot', content: formatLlmError(err), timestamp: new Date() })
    } finally {
      setThinking(false)
    }
  }

  const handleSuggestPolls = async () => {
    addMessage({ variant: 'user', content: 'Suggest a poll for this group', timestamp: new Date(), senderName: 'You' })
    track.liveChatAnalysisTriggered()

    setThinking(true)
    const loadingId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: loadingId, variant: 'bot', content: '', timestamp: new Date(), isLoading: true }])

    await new Promise(r => setTimeout(r, 1500))
    setMessages(prev => prev.filter(m => m.id !== loadingId))
    addMessage({
      variant: 'bot',
      content: "Based on the conversation, here's what I'd suggest polling on:\n\n**Dates:** Saturday Feb 22, Sunday Feb 23\n**Times:** 7:00 PM, 7:30 PM\n**Place vibe:** Silver Lake, Los Feliz\n\nWant me to create this poll in the Poll Builder?",
      timestamp: new Date(),
    })
    setThinking(false)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-160px)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Message stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <MessageItem
                key={msg.id}
                variant={msg.variant}
                content={msg.content}
                timestamp={msg.timestamp}
                senderName={msg.senderName}
                isLoading={msg.isLoading}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Action buttons */}
          <div className="px-4 py-2 border-t border-neutral-100 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Wand2 size={14} />}
              onClick={handleAnalyze}
              disabled={thinking}
            >
              What do you think?
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<MessageSquareDashed size={14} />}
              onClick={handleSuggestPolls}
              disabled={thinking}
            >
              Suggest polls
            </Button>
          </div>

          {/* Composer */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Paste a chat thread or ask a question… (Enter to send)"
                rows={3}
                className={cn(
                  'flex-1 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900',
                  'px-3 py-2.5 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400',
                  'transition-colors duration-150 placeholder-neutral-400'
                )}
              />
              <Button
                variant="primary"
                size="md"
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                aria-label="Send message"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Insight panel */}
        {insight && (
          <div className="w-72 border-l border-neutral-200 bg-neutral-50 overflow-y-auto p-4 space-y-4 hidden lg:block">
            <h3 className="text-sm font-semibold text-neutral-700">Structured insights</h3>

            {insight.consensusPoints.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Consensus</p>
                {insight.consensusPoints.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {s}
                  </div>
                ))}
              </div>
            )}

            {insight.conflicts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Conflicts</p>
                {insight.conflicts.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                    <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                    {c}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Next step</p>
              <p className="text-xs text-neutral-600 leading-relaxed">{insight.nextStep}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
