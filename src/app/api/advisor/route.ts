import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { advisorModel } from '@/lib/advisor/model'
import { buildSystemPrompt, buildMentorPrompt } from '@/lib/advisor/system-prompt'
import type { Lang } from '@/lib/i18n'

export const maxDuration = 120

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada no servidor.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { messages, deep, mentor, lang }: { messages: UIMessage[]; deep?: boolean; mentor?: string; lang?: Lang } =
    await req.json()
  const language: Lang = lang === 'es' ? 'es' : 'pt'

  const result = streamText({
    model: advisorModel(Boolean(deep)),
    system: mentor ? buildMentorPrompt(mentor, language) : buildSystemPrompt(language),
    messages: await convertToModelMessages(messages),
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[advisor] stream error:', msg)
      return msg || 'Erro ao consultar o Conselheiro. Tente novamente.'
    },
  })
}
