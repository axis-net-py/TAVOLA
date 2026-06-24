// Zero-infra conversation history for the standalone Conselheiro: localStorage only.

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface Thread {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: StoredMessage[]
}

const KEY = 'conselheiro:threads:v1'

function readAll(): Thread[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as Thread[]
  } catch {
    return []
  }
}

function writeAll(threads: Thread[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(threads))
}

/** Threads newest-first. */
export function listThreads(): Thread[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getThread(id: string): Thread | undefined {
  return readAll().find((t) => t.id === id)
}

export function saveThread(thread: Thread): void {
  const all = readAll()
  const i = all.findIndex((t) => t.id === thread.id)
  if (i >= 0) all[i] = thread
  else all.push(thread)
  writeAll(all)
}

export function deleteThread(id: string): void {
  writeAll(readAll().filter((t) => t.id !== id))
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.slice(0, 48) || 'Nova consulta'
}
