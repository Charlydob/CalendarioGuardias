import { get, onValue, ref, set, update } from 'firebase/database'
import { database } from '../lib/firebase'
import { getLocalMonths, LocalRepository } from './localRepository'
import { initialProfile, Profile, Repository } from './types'

export class FirebaseRepository implements Repository {
  private root: string
  constructor(uid: string) { this.root = `guardSalaryApp/users/${uid}` }

  async getProfile() {
    const snapshot = await get(ref(database, `${this.root}/profile`))
    return snapshot.exists() ? { ...initialProfile, ...snapshot.val() as Profile } : null
  }
  async saveProfile(profile: Profile) { await set(ref(database, `${this.root}/profile`), profile) }
  subscribeGuards(month: string, listener: (guards: string[]) => void, onError: (error: unknown) => void) {
    return onValue(ref(database, `${this.root}/months/${month}/guards`), snapshot => {
      const value = snapshot.val() as Record<string, boolean> | null
      listener(value ? Object.keys(value).filter(date => value[date]).sort() : [])
    }, onError)
  }
  async saveGuards(month: string, guards: string[]) {
    const values = Object.fromEntries(guards.map(date => [date, true]))
    await set(ref(database, `${this.root}/months/${month}/guards`), values)
  }

  async migrateLocalIfEmpty() {
    const root = ref(database, this.root)
    if ((await get(root)).exists()) return false
    const local = new LocalRepository()
    const profile = await local.getProfile()
    const months = Object.fromEntries(Object.entries(getLocalMonths()).map(([month, guards]) => [month, {
      guards: Object.fromEntries(guards.map(date => [date, true])),
    }]))
    if (profile || Object.keys(months).length) await update(root, { ...(profile && { profile }), months })
    return Boolean(profile || Object.keys(months).length)
  }
}
