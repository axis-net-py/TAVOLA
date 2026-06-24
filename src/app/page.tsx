'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIMessage } from 'ai'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Chat } from '@/components/Chat'
import { listThreads, getThread, deleteThread, newId, type Thread } from '@/lib/history'

export default function Page() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const onNew = () => {
    setActiveId(newId())
    setSidebarOpen(false)
  }
  const onSelect = (id: string) => {
    setActiveId(id)
    setSidebarOpen(false)
  }
  const onDelete = (id: string) => {
    deleteThread(id)
    const rest = listThreads()
    setThreads(rest)
    if (id === activeId) setActiveId(rest[0]?.id ?? newId())
  }

  if (!ready) return null

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          threads={threads}
          activeId={activeId}
          onSelect={onSelect}
          onNew={onNew}
          onDelete={onDelete}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main column */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 h-14 shrink-0 border-b border-border bg-panel px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="text-muted hover:text-fg p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="serif text-lg leading-none text-gold">
            Conselheiro<span className="text-fg"> AXIS</span>
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <Chat key={activeId} threadId={activeId} initialMessages={initialMessages} onPersisted={refresh} />
        </div>
      </main>
    </div>
  )
}
