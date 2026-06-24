'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIMessage } from 'ai'
import { Sidebar } from '@/components/Sidebar'
import { Chat } from '@/components/Chat'
import { listThreads, getThread, deleteThread, newId, type Thread } from '@/lib/history'

export default function Page() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [ready, setReady] = useState(false)

  const refresh = useCallback(() => setThreads(listThreads()), [])

  useEffect(() => {
    const all = listThreads()
    setThreads(all)
    setActiveId(all[0]?.id ?? newId())
    setReady(true)
  }, [])

  const initialMessages: UIMessage[] = useMemo(
    () =>
      (getThread(activeId)?.messages ?? []).map(
        (m) => ({ id: m.id, role: m.role, parts: [{ type: 'text', text: m.content }] }) as UIMessage,
      ),
    [activeId],
  )

  const onNew = () => setActiveId(newId())
  const onSelect = (id: string) => setActiveId(id)
  const onDelete = (id: string) => {
    deleteThread(id)
    const rest = listThreads()
    setThreads(rest)
    if (id === activeId) setActiveId(rest[0]?.id ?? newId())
  }

  if (!ready) return null

  return (
    <div className="flex h-dvh">
      <Sidebar threads={threads} activeId={activeId} onSelect={onSelect} onNew={onNew} onDelete={onDelete} />
      <main className="flex-1 min-w-0">
        <Chat key={activeId} threadId={activeId} initialMessages={initialMessages} onPersisted={refresh} />
      </main>
    </div>
  )
}
