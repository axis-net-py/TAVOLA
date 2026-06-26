'use client'

import { Plus, Trash2, MessageSquare, X } from 'lucide-react'
import type { Thread } from '@/lib/history'
import type { Dict, Lang } from '@/lib/i18n'
import { LangSwitch } from '@/components/LangSwitch'

export function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  t,
  lang,
  setLang,
}: {
  threads: Thread[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onClose?: () => void
  t: Dict
  lang: Lang
  setLang: (l: Lang) => void
}) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-panel flex flex-col h-full">
      <div className="p-5 border-b border-border flex items-start justify-between gap-2">
        <div>
          <h1 className="serif text-2xl leading-none text-gold">
            {t.brandWord}
            <span className="text-fg"> AXIS</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted mt-1.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop: switch lives in the sidebar; on mobile it's in the top bar instead. */}
          <LangSwitch lang={lang} setLang={setLang} className="hidden md:flex" />
          {onClose && (
            <button onClick={onClose} aria-label={t.closeMenuAria} className="md:hidden text-muted hover:text-fg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={onNew}
        className="m-3 flex items-center gap-2 rounded-lg border border-border bg-panel2 px-3 py-2 text-sm text-fg hover:border-gold/50 transition-colors"
      >
        <Plus className="w-4 h-4 text-gold" /> {t.newConsult}
      </button>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {threads.length === 0 && <p className="px-3 py-2 text-xs text-muted">{t.noConversations}</p>}
        {threads.map((th) => (
          <div
            key={th.id}
            onClick={() => onSelect(th.id)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              th.id === activeId ? 'bg-panel2 text-fg' : 'text-muted hover:bg-panel2/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 truncate text-[13px]">{th.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(th.id)
              }}
              aria-label={t.deleteAria}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted hover:text-red-400 transition shrink-0 p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted leading-relaxed">{t.historyNote}</p>
      </div>
    </aside>
  )
}
