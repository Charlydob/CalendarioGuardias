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

  it('migra arrays antiguos de guardias al modelo multimarcas', async () => {
    localStorage.setItem('guardSalaryApp:months:2026-09', JSON.stringify(['2026-09-03']))
    expect(await new LocalRepository().getMonth('2026-09')).toEqual({ marks: { '2026-09-03': ['guard'] } })
  })

  it('persiste marcas múltiples e IRPF mensual', async () => {
    const repository = new LocalRepository()
    await repository.saveMonth('2026-09', { marks: { '2026-09-03': ['guard', 'vacation'] }, irpfOverride: 17.1 })
    expect(await repository.getMonth('2026-09')).toEqual({ marks: { '2026-09-03': ['guard', 'vacation'] }, irpfOverride: 17.1 })
  })

  it('tolera almacenamiento vacío o datos dañados', async () => {
    localStorage.setItem('guardSalaryApp:profile', '{')
    expect(await new LocalRepository().getProfile()).toBeNull()
  })
})
