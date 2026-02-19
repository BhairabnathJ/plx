export interface Group {
  id: string
  name: string
  description?: string
  imageUrl?: string
  createdBy: string
  createdAt: number
  memberCount?: number
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: number
  displayName?: string
  avatarUrl?: string
}
