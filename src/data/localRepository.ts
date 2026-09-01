import { emptyMonth, MonthData, normalizeProfile, Profile, Repository } from './types'
const PREFIX='guardSalaryApp'
function read<T>(key:string):T|null{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:null}catch{return null}}
function normalizeMonth(value:unknown):MonthData {if(Array.isArray(value))return{marks:Object.fromEntries(value.map(date=>[String(date),['guard']]))};const data=(value??{}) as Partial<MonthData>&{guards?:Record<string,boolean>};const marks={...(data.marks??{})};if(data.guards)for(const [date,active] of Object.entries(data.guards))if(active&&!marks[date]?.includes('guard'))marks[date]=[...(marks[date]??[]),'guard'];return{...emptyMonth(),...data,marks}}
export class LocalRepository implements Repository {
 async getProfile(){const profile=read<Partial<Profile>>(`${PREFIX}:profile`);return profile?normalizeProfile(profile):null}
 async saveProfile(profile:Profile){localStorage.setItem(`${PREFIX}:profile`,JSON.stringify(profile))}
 subscribeMonth(month:string,listener:(data:MonthData)=>void){listener(normalizeMonth(read(`${PREFIX}:months:${month}`)));return()=>undefined}
 async saveMonth(month:string,data:MonthData){localStorage.setItem(`${PREFIX}:months:${month}`,JSON.stringify(data))}
 async getMonth(month:string){const raw=read(`${PREFIX}:months:${month}`);return raw===null?null:normalizeMonth(raw)}
 // Compatibility for data and consumers from previous releases.
 subscribeGuards(month:string,listener:(guards:string[])=>void){return this.subscribeMonth(month,data=>listener(Object.entries(data.marks).filter(([,ids])=>ids.includes('guard')).map(([date])=>date)))}
 async saveGuards(month:string,guards:string[]){const data=(await this.getMonth(month))??emptyMonth();for(const date of Object.keys(data.marks))data.marks[date]=data.marks[date].filter(id=>id!=='guard');for(const date of guards)data.marks[date]=[...new Set([...(data.marks[date]??[]),'guard'])];await this.saveMonth(month,data)}
}
export function getLocalMonths(){const months:Record<string,MonthData>={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(`${PREFIX}:months:`))months[key.slice(`${PREFIX}:months:`.length)]=normalizeMonth(read(key))}return months}
