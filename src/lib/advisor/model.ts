import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Free tier: reuse the existing Gemini (Google AI Studio) key — no paid credits needed.
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })

export const MODEL_DEFAULT = 'gemini-2.5-flash'
export const MODEL_DEEP = 'gemini-2.5-pro' // "análise profunda" toggle

export function advisorModel(deep = false) {
  return google(deep ? MODEL_DEEP : MODEL_DEFAULT)
}
