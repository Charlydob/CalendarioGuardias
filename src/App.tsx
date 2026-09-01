import { FormEvent, useEffect, useMemo, useState } from 'react'
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, parseISO, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { auth } from './lib/firebase'
import { FirebaseRepository } from './data/firebaseRepository'
import { LocalRepository } from './data/localRepository'
import { initialProfile, Profile, Repository } from './data/types'
import { friendlyFirebaseError } from './lib/firebaseErrors'
import { ResidencyYear, salaryRates } from './config/salaryRates'
import { getHolidays } from './config/holidays'
import { calculateSalary } from './domain/calculateSalary'

const euro=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'})

function Login({onGuest}:{onGuest:()=>void}) {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
 const authenticate=async(create:boolean)=>{setError('');setBusy(true);try{await(create?createUserWithEmailAndPassword(auth,email,password):signInWithEmailAndPassword(auth,email,password))}catch(err){setError(friendlyFirebaseError(err))}finally{setBusy(false)}}
 const submit=(event:FormEvent)=>{event.preventDefault();void authenticate(false)}
 return <main className="center"><form className="card login" onSubmit={submit}><div className="brand">G</div><h1>Calculadora de guardias</h1><p>Calcula tu salario esperado y sincronízalo si creas una cuenta.</p><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy?'Conectando…':'Entrar'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>void authenticate(true)}>Crear cuenta</button><button type="button" className="link" onClick={onGuest}>Usar temporalmente sin cuenta</button></form></main>
}

function Settings({profile,onSave,onClose}: {profile:Profile;onSave:(p:Profile)=>void;onClose:()=>void}){const[p,setP]=useState(profile);const[newDate,setNewDate]=useState('');
 const add=()=>{if(newDate&&!p.specialHolidays.includes(newDate)){setP({...p,specialHolidays:[...p.specialHolidays,newDate].sort()});setNewDate('')}}
 return <div className="overlay"><section className="modal"><header><h2>Ajustes</h2><button className="icon" onClick={onClose} aria-label="Cerrar">×</button></header><label>Año de residencia<select value={p.residencyYear} onChange={e=>{const y=e.target.value as ResidencyYear;setP({...p,residencyYear:y})}}>{Object.keys(salaryRates).map(y=><option key={y}>{y}</option>)}</select></label><small>Sugerencia de nómina ordinaria: {euro.format(salaryRates[p.residencyYear].base)}</small><label>Salario base bruto mensual (€)<input type="number" min="0" step="0.01" value={p.baseSalary||''} placeholder={String(salaryRates[p.residencyYear].base)} onChange={e=>setP({...p,baseSalary:Number(e.target.value)})}/></label><label>IRPF (%)<input type="number" min="0" max="100" step="0.1" value={p.irpf||''} onChange={e=>setP({...p,irpf:Number(e.target.value)})}/></label><details><summary>Festivos especiales</summary><p className="muted">Añade solo fechas confirmadas por tu centro.</p><div className="date-add"><input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)}/><button type="button" onClick={add}>Añadir</button></div>{p.specialHolidays.map(d=><div className="special" key={d}><span>{d}</span><button onClick={()=>setP({...p,specialHolidays:p.specialHolidays.filter(x=>x!==d)})}>Quitar</button></div>)}</details><button className="primary" onClick={()=>onSave(p)}>Guardar ajustes</button></section></div>}

function Dashboard({repository,user,onExit}:{repository:Repository;user:User|null;onExit:()=>void}) {
 const [month,setMonth]=useState(new Date(2026,8,1)); const [profile,setProfile]=useState<Profile|null>(null); const [guards,setGuards]=useState<string[]>([]); const [settings,setSettings]=useState(false); const [loading,setLoading]=useState(true); const [notice,setNotice]=useState(''); const key=format(month,'yyyy-MM')
 useEffect(()=>{let active=true;repository.getProfile().then(value=>{if(active)setProfile(value??initialProfile)}).catch(error=>{if(active){setNotice(friendlyFirebaseError(error));setProfile(initialProfile)}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[repository])
 useEffect(()=>repository.subscribeGuards(key,setGuards,error=>setNotice(friendlyFirebaseError(error))),[repository,key])
 const calc=useMemo(()=>calculateSalary({guards,residencyYear:profile?.residencyYear??'R1',baseSalary:profile?.baseSalary??0,irpf:profile?.irpf??0,specialHolidays:profile?.specialHolidays??[]}),[guards,profile])
 const days=eachDayOfInterval({start:startOfMonth(month),end:endOfMonth(month)}); const blanks=(getDay(startOfMonth(month))+6)%7; const holidays=getHolidays(month.getFullYear())
 const toggle=(date:string)=>{const previous=guards;const next=guards.includes(date)?guards.filter(x=>x!==date):[...guards,date].sort();setGuards(next);repository.saveGuards(key,next).catch(error=>{setGuards(previous);setNotice(friendlyFirebaseError(error))})}
 const save=(next:Profile)=>{repository.saveProfile(next).then(()=>{setProfile(next);setSettings(false)}).catch(error=>setNotice(friendlyFirebaseError(error)))}
 if(loading||!profile)return <main className="center"><p>Cargando…</p></main>
 return <main className="app"><header className="top"><button className="text-button" onClick={onExit}>{user?'Cerrar sesión':'Salir del modo temporal'}</button><span className="mode">{user?user.email:'Modo temporal'}</span><button className="text-button" onClick={()=>setSettings(true)}>Ajustes</button></header>{notice&&<div className="notice" role="alert">{notice}<button onClick={()=>setNotice('')} aria-label="Cerrar aviso">×</button></div>}<section className="hero"><div className="month-nav"><button onClick={()=>setMonth(subMonths(month,1))} aria-label="Mes anterior">‹</button><h1>{format(month,'MMMM yyyy',{locale:es})}</h1><button onClick={()=>setMonth(addMonths(month,1))} aria-label="Mes siguiente">›</button></div><p>Salario esperado</p><strong>{euro.format(calc.estimatedAfterIrpf)}</strong><span>Neto estimado tras IRPF</span><div className="summary"><span>Base <b>{euro.format(calc.baseSalary)}</b></span><span>Guardias <b>{euro.format(calc.guardPayments)}</b></span><span>IRPF estimado <b>−{euro.format(calc.irpfAmount)}</b></span></div></section><section className="calendar-card"><h2>Marca los días en los que tienes guardia</h2><div className="weekdays">{'LMXJVSD'.split('').map((d,i)=><span key={i}>{d}</span>)}</div><div className="grid">{Array.from({length:blanks},(_,i)=><span key={'b'+i}/>)}{days.map(day=>{const date=format(day,'yyyy-MM-dd');const selected=guards.includes(date);const holiday=Boolean(holidays[date]);const special=profile.specialHolidays.includes(date);return <button key={date} onClick={()=>toggle(date)} className={`day ${selected?'selected':''} ${holiday||special?'holiday':''}`} aria-pressed={selected} title={special?'Festivo especial':holidays[date]}><span>{format(day,'d')}</span>{selected&&<b>G</b>}{(holiday||special)&&<i/>}</button>})}</div></section><details className="breakdown"><summary>Ver desglose ({guards.length})</summary>{calc.details.length===0?<p className="muted">Aún no hay guardias marcadas.</p>:calc.details.map(item=><div key={item.date}><span>{format(parseISO(item.date),'d MMMM',{locale:es})} — {item.label}</span><b>{euro.format(item.amount)}</b></div>)}<footer>Total guardias <b>{euro.format(calc.guardPayments)}</b></footer></details><p className="disclaimer">Estimación orientativa. No incluye otras cotizaciones o retenciones.</p>{settings&&<Settings profile={profile} onSave={save} onClose={()=>setSettings(false)}/>}</main>
}

export function App(){
 const [user,setUser]=useState<User|null>(null); const [guest,setGuest]=useState(()=>sessionStorage.getItem('guardSalaryApp:guest')==='true'); const [ready,setReady]=useState(false); const [migration,setMigration]=useState('')
 useEffect(()=>onAuthStateChanged(auth,current=>{setUser(current);setReady(true)},()=>setReady(true)),[])
 const repository=useMemo<Repository>(()=>user?new FirebaseRepository(user.uid):new LocalRepository(),[user])
 useEffect(()=>{if(!user)return;const remote=repository as FirebaseRepository;remote.migrateLocalIfEmpty().then(done=>{if(done)setMigration('Tus datos locales se han migrado a tu cuenta.')}).catch(()=>undefined)},[user,repository])
 const useGuest=()=>{sessionStorage.setItem('guardSalaryApp:guest','true');setGuest(true)}
 const exit=()=>{if(user)void signOut(auth);else{sessionStorage.removeItem('guardSalaryApp:guest');setGuest(false)}}
 if(!ready)return <main className="center">Cargando…</main>
 if(!user&&!guest)return <Login onGuest={useGuest}/>
 return <><Dashboard repository={repository} user={user} onExit={exit}/>{migration&&<div className="toast" role="status" onClick={()=>setMigration('')}>{migration}</div>}</>
}
