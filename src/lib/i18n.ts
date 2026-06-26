export type Lang = 'pt' | 'es'

export const LANG_KEY = 'conselheiro:lang'

export interface Dict {
  brandWord: string
  subtitle: string
  newConsult: string
  noConversations: string
  historyNote: string
  deleteAria: string
  closeMenuAria: string
  openMenuAria: string
  talkWith: string
  roundtableOption: string
  soloBadge: string
  emptyTitle: string
  emptyBody: string
  emptyMentorTitle: string // contains {m}
  emptyMentorBody: string // contains {m}
  consulting: string
  mentorThinking: string // contains {m}
  errorFallback: string
  placeholder: string
  placeholderMentor: string // contains {m}
  deepTitle: string
  speakTitle: string
}

export const dict: Record<Lang, Dict> = {
  pt: {
    brandWord: 'Conselheiro',
    subtitle: 'Mesa Redonda',
    newConsult: 'Nova consulta',
    noConversations: 'Nenhuma conversa ainda.',
    historyNote: 'Histórico salvo localmente neste navegador.',
    deleteAria: 'Excluir conversa',
    closeMenuAria: 'Fechar menu',
    openMenuAria: 'Abrir menu',
    talkWith: 'Falar com:',
    roundtableOption: 'Mesa redonda — todos os mentores',
    soloBadge: '· modo solo',
    emptyTitle: 'Traga seu problema à mesa',
    emptyBody:
      'Pricing, escala, vendas, marca, decisão. Os mentores mais pertinentes respondem em primeira pessoa, e o Arquiteto fecha com um plano de ação.',
    emptyMentorTitle: 'Debate com {m}',
    emptyMentorBody: '{m} responde em primeira pessoa, como ele mesmo. Pergunte, provoque, discorde — é um diálogo direto.',
    consulting: 'Consultando a mesa...',
    mentorThinking: '{m} está pensando...',
    errorFallback: 'Erro ao consultar o Conselheiro. Tente novamente.',
    placeholder: 'Traga seu problema…',
    placeholderMentor: 'Pergunte a {m}…',
    deepTitle: 'Análise profunda',
    speakTitle: 'Falar',
  },
  es: {
    brandWord: 'Consejero',
    subtitle: 'Mesa Redonda',
    newConsult: 'Nueva consulta',
    noConversations: 'Aún no hay conversaciones.',
    historyNote: 'Historial guardado localmente en este navegador.',
    deleteAria: 'Eliminar conversación',
    closeMenuAria: 'Cerrar menú',
    openMenuAria: 'Abrir menú',
    talkWith: 'Hablar con:',
    roundtableOption: 'Mesa redonda — todos los mentores',
    soloBadge: '· modo solo',
    emptyTitle: 'Trae tu problema a la mesa',
    emptyBody:
      'Pricing, escala, ventas, marca, decisión. Los mentores más pertinentes responden en primera persona, y el Arquitecto cierra con un plan de acción.',
    emptyMentorTitle: 'Debate con {m}',
    emptyMentorBody: '{m} responde en primera persona, como él mismo. Pregunta, provoca, discrepa — es un diálogo directo.',
    consulting: 'Consultando la mesa...',
    mentorThinking: '{m} está pensando...',
    errorFallback: 'Error al consultar al Consejero. Inténtalo de nuevo.',
    placeholder: 'Trae tu problema…',
    placeholderMentor: 'Pregúntale a {m}…',
    deepTitle: 'Análisis profundo',
    speakTitle: 'Hablar',
  },
}
