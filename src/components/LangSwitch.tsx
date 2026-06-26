'use client'

import type { Lang } from '@/lib/i18n'

function BrazilFlag() {
  return (
    <svg viewBox="0 0 24 16" className="w-6 h-4 block" aria-hidden="true">
      <rect width="24" height="16" fill="#009C3B" />
      <path d="M12 2.2 22 8 12 13.8 2 8Z" fill="#FFDF00" />
      <circle cx="12" cy="8" r="3.1" fill="#002776" />
    </svg>
  )
}

function ParaguayFlag() {
  return (
    <svg viewBox="0 0 24 16" className="w-6 h-4 block" aria-hidden="true">
      <rect width="24" height="16" fill="#ffffff" />
      <rect width="24" height="5.34" fill="#D52B1E" />
      <rect width="24" height="5.34" y="10.66" fill="#0038A8" />
      <circle cx="12" cy="8" r="1.7" fill="#FEDF00" stroke="#1a7a35" strokeWidth="0.4" />
    </svg>
  )
}

export function LangSwitch({
  lang,
  setLang,
  className = '',
}: {
  lang: Lang
  setLang: (l: Lang) => void
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        onClick={() => setLang('pt')}
        aria-label="Português"
        title="Português (Brasil)"
        className={`rounded-sm overflow-hidden border transition ${
          lang === 'pt' ? 'border-gold ring-1 ring-gold' : 'border-border opacity-45 hover:opacity-100'
        }`}
      >
        <BrazilFlag />
      </button>
      <button
        onClick={() => setLang('es')}
        aria-label="Español"
        title="Español (Paraguay)"
        className={`rounded-sm overflow-hidden border transition ${
          lang === 'es' ? 'border-gold ring-1 ring-gold' : 'border-border opacity-45 hover:opacity-100'
        }`}
      >
        <ParaguayFlag />
      </button>
    </div>
  )
}
