import type { User } from '@/types'

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    clerkUserId: 'clerk_alex',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alex',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-2',
    clerkUserId: 'clerk_sam',
    name: 'Sam Chen',
    email: 'sam@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sam',
    createdAt: Date.now() - 28 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 28 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-3',
    clerkUserId: 'clerk_jordan',
    name: 'Jordan Park',
    email: 'jordan@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=jordan',
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-4',
    clerkUserId: 'clerk_morgan',
    name: 'Morgan Lee',
    email: 'morgan@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=morgan',
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'user-5',
    clerkUserId: 'clerk_taylor',
    name: 'Taylor Kim',
    email: 'taylor@example.com',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=taylor',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
]

export const CURRENT_USER = MOCK_USERS[0]!
