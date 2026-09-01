import { holidays2026 } from './2026'
const holidaysByYear: Record<number,Record<string,string>> = {2026:holidays2026}
export const getHolidays = (year:number) => holidaysByYear[year] ?? {}
