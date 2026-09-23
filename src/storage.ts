import type { Account, Score } from './types'

const ACCOUNTS_KEY = 'tutor.accounts'
const CURRENT_USER_KEY = 'tutor.currentUser'
const scoresKey = (username: string) => `tutor.scores.${username.toLowerCase()}`

export function getAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as Account[]) : []
  } catch {
    return []
  }
}

export function findAccount(username: string): Account | undefined {
  return getAccounts().find((a) => a.username.toLowerCase() === username.toLowerCase())
}

export function createAccount(username: string, birthYear: number): Account {
  const accounts = getAccounts()
  const account: Account = { username: username.trim(), birthYear }
  accounts.push(account)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return account
}

export function getCurrentUser(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function setCurrentUser(username: string): void {
  localStorage.setItem(CURRENT_USER_KEY, username)
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getScores(username: string): Record<string, Score> {
  try {
    const raw = localStorage.getItem(scoresKey(username))
    return raw ? (JSON.parse(raw) as Record<string, Score>) : {}
  } catch {
    return {}
  }
}

export function setScore(username: string, exerciseId: string, score: Score): void {
  const scores = getScores(username)
  scores[exerciseId] = score
  localStorage.setItem(scoresKey(username), JSON.stringify(scores))
}
