export type ConstraintKind = 'hard' | 'soft' | 'mention'
export type ConstraintState = 'detected' | 'accepted' | 'edited' | 'removed'
export type ProvenanceTag = 'chat' | 'habit' | 'manual'
export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface Constraint {
  id: string
  sessionId: string
  kind: ConstraintKind
  text: string
  state: ConstraintState
  provenance: ProvenanceTag
  confidence: ConfidenceLevel
  originalText?: string
  editedBy?: string
}
