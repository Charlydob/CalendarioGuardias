import { get,onValue,ref,set,update } from 'firebase/database'
import { database } from '../lib/firebase'
import { getLocalMonths,LocalRepository } from './localRepository'
import { emptyMonth,MonthData,normalizeProfile,Profile,Repository } from './types'
function decode(value:unknown):MonthData {const raw=(value??{}) as Partial<MonthData>&{guards?:Record<string,boolean>};const marks={...(raw.marks??{})};if(raw.guards)for(const [date,on] of Object.entries(raw.guards))if(on)marks[date]=[...new Set([...(marks[date]??[]),'guard'])];return{...emptyMonth(),...raw,marks}}
export class FirebaseRepository implements Repository {private root:string;constructor(uid:string){this.root=`guardSalaryApp/users/${uid}`}
 async getProfile(){const snapshot=await get(ref(database,`${this.root}/profile`));return snapshot.exists()?normalizeProfile(snapshot.val() as Partial<Profile>):null}
 async saveProfile(profile:Profile){await set(ref(database,`${this.root}/profile`),profile)}
 subscribeMonth(month:string,listener:(data:MonthData)=>void,onError:(error:unknown)=>void=()=>undefined){return onValue(ref(database,`${this.root}/months/${month}`),snapshot=>listener(decode(snapshot.val())),onError)}
 async saveMonth(month:string,data:MonthData){await set(ref(database,`${this.root}/months/${month}`),data)}
 async getMonth(month:string){const snapshot=await get(ref(database,`${this.root}/months/${month}`));return snapshot.exists()?decode(snapshot.val()):null}
 async migrateLocalIfEmpty(){const root=ref(database,this.root);if((await get(root)).exists())return false;const local=new LocalRepository();const profile=await local.getProfile();const months=getLocalMonths();if(profile||Object.keys(months).length)await update(root,{...(profile&&{profile}),months});return Boolean(profile||Object.keys(months).length)}
}
