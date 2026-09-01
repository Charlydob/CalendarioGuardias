import { ResidencyYear } from '../config/salaryRates'

export type PaymentMode = 'guard' | 'vacation' | 'none' | 'fixed'
export type NativeMarkerId = 'guard' | 'vacation' | 'leave'
export interface MarkerType { id:string; name:string; symbol:string; color:string; paymentMode:PaymentMode; fixedAmount?:number; native?:boolean }
export interface MonthData { marks:Record<string,string[]>; irpfOverride?:number }
export type Profile = { residencyYear:ResidencyYear; baseSalary:number; irpf:number; specialHolidays:string[]; markerTypes:MarkerType[] }

export const nativeMarkers:MarkerType[] = [
 {id:'guard',name:'Guardia',symbol:'G',color:'#176b5b',paymentMode:'guard',native:true},
 {id:'vacation',name:'Vacaciones',symbol:'V',color:'#2775a9',paymentMode:'vacation',native:true},
 {id:'leave',name:'Saliente',symbol:'S',color:'#8a5b35',paymentMode:'none',native:true},
]
export const initialProfile:Profile={residencyYear:'R1',baseSalary:0,irpf:0,specialHolidays:[],markerTypes:nativeMarkers}
export const emptyMonth=():MonthData=>({marks:{}})

export interface Repository {
 getProfile():Promise<Profile|null>; saveProfile(profile:Profile):Promise<void>
 subscribeMonth(month:string,listener:(data:MonthData)=>void,onError?:(error:unknown)=>void):()=>void
 saveMonth(month:string,data:MonthData):Promise<void>
 getMonth(month:string):Promise<MonthData|null>
}

export function normalizeProfile(value:Partial<Profile>):Profile {
 const saved=value.markerTypes??[]
 const markers:MarkerType[]=nativeMarkers.map(native=>({...native,...saved.find(item=>item.id===native.id),paymentMode:native.paymentMode,native:true}))
 markers.push(...saved.filter(item=>!nativeMarkers.some(native=>native.id===item.id)))
 return {...initialProfile,...value,markerTypes:markers}
}
