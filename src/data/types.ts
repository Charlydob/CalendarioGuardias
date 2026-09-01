import { ResidencyYear } from '../config/salaryRates'

export type Profile = {
  residencyYear: ResidencyYear
  baseSalary: number
  irpf: number
  specialHolidays: string[]
}

export const initialProfile: Profile = {
  residencyYear: 'R1', baseSalary: 0, irpf: 0, specialHolidays: [],
}

export interface Repository {
  getProfile(): Promise<Profile | null>
  saveProfile(profile: Profile): Promise<void>
  subscribeGuards(month: string, listener: (guards: string[]) => void, onError: (error: unknown) => void): () => void
  saveGuards(month: string, guards: string[]): Promise<void>
}
