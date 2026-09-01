import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalRepository } from './localRepository'
import { initialProfile } from './types'

describe('LocalRepository', () => {
  beforeEach(() => localStorage.clear())

  it('persiste perfil y guardias entre instancias', async () => {
    const first = new LocalRepository()
    const profile = { ...initialProfile, residencyYear: 'R3' as const, baseSalary: 1769.55, irpf: 15 }
    await first.saveProfile(profile)
    await first.saveGuards('2026-09', ['2026-09-03', '2026-09-08'])

    const second = new LocalRepository()
    expect(await second.getProfile()).toEqual(profile)
    const listener = vi.fn()
    second.subscribeGuards('2026-09', listener)
    expect(listener).toHaveBeenCalledWith(['2026-09-03', '2026-09-08'])
  })

  it('tolera almacenamiento vacío o datos dañados', async () => {
    localStorage.setItem('guardSalaryApp:profile', '{')
    expect(await new LocalRepository().getProfile()).toBeNull()
  })
})
