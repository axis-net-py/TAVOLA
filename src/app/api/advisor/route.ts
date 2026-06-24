import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { advisorModel } from '@/lib/advisor/model'
import { buildSystemPrompt } from '@/lib/advisor/system-prompt'

export const maxDuration = 120

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { messages, deep }: { messages: UIMessage[]; deep?: boolean } = await req.json()

  const result = streamText({
    model: advisorModel(Boolean(deep)),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: {
      web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }),
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
