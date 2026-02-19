import type { Group, GroupMember } from '@/types'

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: 'The Usual Crew',
    description: 'Weekend adventures and spontaneous dinners',
    imageUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=crew',
    createdBy: 'user-1',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    memberCount: 7,
  },
  {
    id: 'group-2',
    name: 'Work Fam 🏢',
    description: 'Team socials and after-work plans',
    imageUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=work',
    createdBy: 'user-1',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    memberCount: 12,
  },
]

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  { id: 'gm-1', groupId: 'group-1', userId: 'user-1', role: 'owner', joinedAt: Date.now() - 30 * 86400000, displayName: 'Alex Rivera' },
  { id: 'gm-2', groupId: 'group-1', userId: 'user-2', role: 'member', joinedAt: Date.now() - 28 * 86400000, displayName: 'Sam Chen' },
  { id: 'gm-3', groupId: 'group-1', userId: 'user-3', role: 'member', joinedAt: Date.now() - 25 * 86400000, displayName: 'Jordan Park' },
  { id: 'gm-4', groupId: 'group-1', userId: 'user-4', role: 'member', joinedAt: Date.now() - 20 * 86400000, displayName: 'Morgan Lee' },
  { id: 'gm-5', groupId: 'group-1', userId: 'user-5', role: 'member', joinedAt: Date.now() - 15 * 86400000, displayName: 'Taylor Kim' },
]
