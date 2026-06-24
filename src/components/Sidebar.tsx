'use client'

import { Plus, Trash2, MessageSquare } from 'lucide-react'
import type { Thread } from '@/lib/history'

export function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  threads: Thread[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-panel flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <h1 className="serif text-2xl leading-none text-gold">
          Conselheiro<span className="text-fg"> AXIS</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted mt-1.5">Mesa Redonda</p>
      </div>

      <button
        onClick={onNew}
        className="m-3 flex items-center gap-2 rounded-lg border border-border bg-panel2 px-3 py-2 text-sm text-fg hover:border-gold/50 transition-colors"
      >
        <Plus className="w-4 h-4 text-gold" /> Nova consulta
      </button>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {threads.length === 0 && <p className="px-3 py-2 text-xs text-muted">Nenhuma conversa ainda.</p>}
        {threads.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              t.id === activeId ? 'bg-panel2 text-fg' : 'text-muted hover:bg-panel2/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 truncate text-[13px]">{t.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(t.id)
              }}
              aria-label="Excluir conversa"
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted leading-relaxed">
          Histórico salvo localmente neste navegador.
        </p>
      </div>
    </aside>
  )
}
