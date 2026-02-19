export type TonePreset = 'friendly' | 'default' | 'concise'

export interface Summary {
  id: string
  sessionId: string
  draftText: string
  finalText?: string
  model?: string
  tone?: TonePreset
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface SummaryMessageDraft {
  text: string
  model: string
}
