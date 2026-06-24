import { anthropic } from '@ai-sdk/anthropic'

// Direct Anthropic provider — needed for the web_search server tool.
export const MODEL_DEFAULT = 'claude-sonnet-4-6'
export const MODEL_DEEP = 'claude-opus-4-8' // "análise profunda" toggle

export function advisorModel(deep = false) {
  return anthropic(deep ? MODEL_DEEP : MODEL_DEFAULT)
}
