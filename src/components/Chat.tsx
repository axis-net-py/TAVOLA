'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Mic, MicOff, Send, Loader2, Sparkles, User, BrainCircuit, AlertCircle } from 'lucide-react'
import { getThread, saveThread, titleFrom, type StoredMessage } from '@/lib/history'
import { MENTOR_ROSTER } from '@/lib/advisor/mentors'
import type { Dict, Lang } from '@/lib/i18n'

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
  t,
  lang,
}: {
  threadId: string
  initialMessages: UIMessage[]
  onPersisted: () => void
  t: Dict
  lang: Lang
}) {
  const [deep, setDeep] = useState(false)
  const deepRef = useRef(deep)
  deepRef.current = deep

  const [mentor, setMentor] = useState('')
  const mentorRef = useRef(mentor)
  mentorRef.current = mentor

  const langRef = useRef(lang)
  langRef.current = lang

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/advisor',
        body: () => ({ deep: deepRef.current, mentor: mentorRef.current, lang: langRef.current }),
      }),
    [],
  )
  const { messages, sendMessage, status, error } = useChat({ id: threadId, messages: initialMessages, transport })

  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const speechRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const initialLen = useRef(initialMessages.length)
  const loading = status === 'submitted' || status === 'streaming'

  const mentorGroups = useMemo(() => {
    const g = new Map<string, string[]>()
    for (const m of MENTOR_ROSTER) g.set(m.domain, [...(g.get(m.domain) ?? []), m.name])
    return [...g.entries()]
  }, [])

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

  // Web Speech voice input — language follows the UI language.
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
    rec.lang = lang === 'es' ? 'es-ES' : 'pt-BR'
    rec.onstart = () => setRecording(true)
    rec.onresult = (e) => setInput(e.results[0][0].transcript)
    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)
    speechRef.current = rec
  }, [lang])

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

  const firstName = mentor.split(' ')[0]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mentor picker — "convocar" a single mentor or keep the full roundtable */}
      <div className="border-b border-border px-4 sm:px-5 py-2 flex items-center gap-2 text-[12px] shrink-0">
        <span className="text-muted shrink-0">{t.talkWith}</span>
        <select
          value={mentor}
          onChange={(e) => setMentor(e.target.value)}
          className="flex-1 min-w-0 bg-panel2 border border-border rounded-lg px-2 py-1.5 text-fg focus:outline-none focus:border-gold/50"
        >
          <option value="">{t.roundtableOption}</option>
          {mentorGroups.map(([domain, names]) => (
            <optgroup key={domain} label={domain}>
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {mentor && <span className="text-gold shrink-0 hidden sm:inline">{t.soloBadge}</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-3xl px-5 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center pt-12">
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
              {mentor ? (
                <>
                  <h2 className="serif text-3xl text-fg mb-2">{t.emptyMentorTitle.replace('{m}', mentor)}</h2>
                  <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">{t.emptyMentorBody.replace('{m}', mentor)}</p>
                </>
              ) : (
                <>
                  <h2 className="serif text-3xl text-fg mb-2">{t.emptyTitle}</h2>
                  <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">{t.emptyBody}</p>
                </>
              )}
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
                <span className="text-sm text-muted">{mentor ? t.mentorThinking.replace('{m}', mentor) : t.consulting}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-red-500/40 bg-red-500/10 text-red-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error.message || t.errorFallback}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-panel/60 backdrop-blur shrink-0">
        <form onSubmit={submit} className="mx-auto max-w-3xl px-5 py-4 flex items-end gap-2">
          <button
            type="button"
            onClick={() => setDeep((d) => !d)}
            title={t.deepTitle}
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              deep ? 'border-gold/60 bg-gold/10 text-gold' : 'border-border text-muted hover:text-fg'
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleRecording}
            title={t.speakTitle}
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
            placeholder={mentor ? t.placeholderMentor.replace('{m}', firstName) : t.placeholder}
            className="flex-1 resize-none bg-panel2 border border-border rounded-xl px-4 py-2.5 text-[14px] leading-6 text-fg placeholder:text-muted focus:outline-none focus:border-gold/50 max-h-40"
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
