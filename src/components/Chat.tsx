'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Mic, MicOff, Send, Loader2, Sparkles, User, BrainCircuit, AlertCircle } from 'lucide-react'
import { getThread, saveThread, titleFrom, type StoredMessage } from '@/lib/history'

function messageText(msg: UIMessage): string {
  return (msg.parts ?? []).map((p) => (p.type === 'text' ? p.text : '')).join('')
}

/** Render assistant text with **bold** segments highlighted (mentor names in gold), preserving line breaks. */
function RichText({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className="whitespace-pre-line leading-relaxed">
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="text-gold font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  )
}

export function Chat({
  threadId,
  initialMessages,
  onPersisted,
}: {
  threadId: string
  initialMessages: UIMessage[]
  onPersisted: () => void
}) {
  const [deep, setDeep] = useState(false)
  const deepRef = useRef(deep)
  deepRef.current = deep

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/advisor', body: () => ({ deep: deepRef.current }) }),
    [],
  )
  const { messages, sendMessage, status, error } = useChat({ id: threadId, messages: initialMessages, transport })

  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const speechRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const initialLen = useRef(initialMessages.length)
  const loading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist to localStorage once a turn completes (skip the no-op save of just-loaded history).
  useEffect(() => {
    if (status !== 'ready' || messages.length === 0 || messages.length === initialLen.current) return
    const stored: StoredMessage[] = messages
      .map((m) => ({ id: m.id, role: m.role === 'assistant' ? 'assistant' : 'user', content: messageText(m) }) as StoredMessage)
      .filter((m) => m.content)
    if (stored.length === 0) return
    const existing = getThread(threadId)
    const firstUser = stored.find((m) => m.role === 'user')
    saveThread({
      id: threadId,
      title: existing?.title || titleFrom(firstUser?.content || ''),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages: stored,
    })
    onPersisted()
  }, [status, messages, threadId, onPersisted])

  // Web Speech voice input (pt-BR).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return
    const rec = new Ctor() as {
      continuous: boolean
      interimResults: boolean
      lang: string
      onstart: () => void
      onresult: (e: { results: Record<number, Record<number, { transcript: string }>> }) => void
      onerror: () => void
      onend: () => void
      start: () => void
      stop: () => void
    }
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'pt-BR'
    rec.onstart = () => setRecording(true)
    rec.onresult = (e) => setInput(e.results[0][0].transcript)
    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)
    speechRef.current = rec
  }, [])

  const toggleRecording = () => {
    const rec = speechRef.current
    if (!rec) return
    if (recording) rec.stop()
    else rec.start()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center pt-16">
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
              <h2 className="serif text-3xl text-fg mb-2">Traga seu problema à mesa</h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Pricing, escala, vendas, marca, decisão. Os mentores mais pertinentes respondem em primeira pessoa, e o
                Arquiteto fecha com um plano de ação.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' ? 'border-border bg-panel2 text-muted' : 'border-gold/40 bg-gold/10 text-gold'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] ${
                  msg.role === 'user'
                    ? 'bg-panel2 border border-border text-fg'
                    : 'bg-panel border border-border text-fg/90'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <RichText content={messageText(msg)} />
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">{messageText(msg)}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gold/40 bg-gold/10 text-gold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-panel border border-border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span className="text-sm text-muted">Consultando a mesa...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-red-500/40 bg-red-500/10 text-red-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error.message || 'Erro ao consultar o Conselheiro. Tente novamente.'}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-panel/60 backdrop-blur">
        <form onSubmit={submit} className="mx-auto max-w-3xl px-5 py-4 flex items-end gap-2">
          <button
            type="button"
            onClick={() => setDeep((d) => !d)}
            title="Análise profunda (Opus)"
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              deep ? 'border-gold/60 bg-gold/10 text-gold' : 'border-border text-muted hover:text-fg'
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleRecording}
            title="Falar"
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              recording ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' : 'border-border text-muted hover:text-fg'
            }`}
          >
            {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e)
            }}
            rows={1}
            placeholder="Traga seu problema à mesa..."
            className="flex-1 resize-none bg-panel2 border border-border rounded-xl px-4 py-2.5 text-[14px] text-fg placeholder:text-muted focus:outline-none focus:border-gold/50 max-h-40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-gold text-bg hover:bg-gold/90 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
