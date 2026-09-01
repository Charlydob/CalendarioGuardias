import { initialProfile, Profile, Repository } from './types'

const PREFIX = 'guardSalaryApp'

export class LocalRepository implements Repository {
  async getProfile() { const profile = read<Profile>(`${PREFIX}:profile`); return profile ? { ...initialProfile, ...profile } : null }
  async saveProfile(profile: Profile) { localStorage.setItem(`${PREFIX}:profile`, JSON.stringify(profile)) }
  subscribeGuards(month: string, listener: (guards: string[]) => void) {
    listener(read<string[]>(`${PREFIX}:months:${month}`) ?? [])
    return () => undefined
  }
  async saveGuards(month: string, guards: string[]) {
    localStorage.setItem(`${PREFIX}:months:${month}`, JSON.stringify(guards))
  }
}

function read<T>(key: string): T | null {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : null }
  catch { return null }
}

export function getLocalMonths() {
  const months: Record<string, string[]> = {}
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index)
    if (key?.startsWith(`${PREFIX}:months:`)) months[key.slice(`${PREFIX}:months:`.length)] = read<string[]>(key) ?? []
  }
  return months
}
