export interface Group {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  createdBy: string
  createdAt: number
  memberCount?: number
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: 'organizer' | 'member'
  joinedAt: number
  displayName?: string
  avatarUrl?: string
}
