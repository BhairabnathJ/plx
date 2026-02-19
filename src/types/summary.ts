export type TonePreset = 'friendly' | 'default' | 'concise'

export interface Summary {
  id: string
  sessionId: string
  draftText: string
  tone: TonePreset
  editedText?: string
  generatedAt: number
  editedBy?: string
  editedAt?: number
}

export interface SummaryMessageDraft {
  text: string
  tone: TonePreset
  tokens: {
    date?: string
    time?: string
    place?: string
    attendance?: string
  }
}
