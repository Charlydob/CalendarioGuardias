import { getDay, parseISO } from 'date-fns'
import { getHolidays } from '../config/holidays'
import { GuardType, ResidencyYear, salaryRates } from '../config/salaryRates'
export interface GuardDetail { date:string; type:GuardType; label:string; amount:number }
export interface SalaryCalculation { baseSalary:number; guardPayments:number; grossSalary:number; irpfAmount:number; estimatedAfterIrpf:number; details:GuardDetail[] }
export function classifyGuard(date:string,special:string[]=[]):GuardType {
 if(special.includes(date)) return 'special'
 const parsed=parseISO(date)
 if(getHolidays(parsed.getFullYear())[date]) return 'holiday'
 const day=getDay(parsed)
 if(day===0) return 'holiday'
 if(day===6) return 'saturday'
 return 'weekday'
}
const labels:Record<GuardType,string>={weekday:'Laborable',saturday:'Sábado',holiday:'Domingo / festivo',special:'Festivo especial'}
export function calculateSalary(args:{guards:string[];residencyYear:ResidencyYear;baseSalary:number;irpf:number;specialHolidays?:string[]}):SalaryCalculation {
 const rate=salaryRates[args.residencyYear]
 const details=[...new Set(args.guards)].sort().map(date=>{const type=classifyGuard(date,args.specialHolidays);return {date,type,label:labels[type],amount:rate[type]}})
 const guardPayments=details.reduce((sum,item)=>sum+item.amount,0)
 const grossSalary=args.baseSalary+guardPayments
 const irpfAmount=grossSalary*Math.max(0,args.irpf)/100
 return {baseSalary:args.baseSalary,guardPayments,grossSalary,irpfAmount,estimatedAfterIrpf:grossSalary-irpfAmount,details}
}
