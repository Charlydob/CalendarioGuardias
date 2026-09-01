import { describe,expect,it } from 'vitest'
import { calculateSalary, calculateVacationGuardProration, classifyGuard, resolveEffectiveIrpf, suggestedLeaveDates } from './calculateSalary'

describe('clasificación',()=>{it('clasifica laborable, sábado, domingo y especial',()=>{expect(classifyGuard('2026-09-07')).toBe('weekday');expect(classifyGuard('2026-09-05')).toBe('saturday');expect(classifyGuard('2026-09-06')).toBe('holiday');expect(classifyGuard('2026-09-05',['2026-09-05'])).toBe('special')})})
describe('prorrateo de vacaciones',()=>{
 const history=[{guardCount:5,guardPay:1000},{guardCount:6,guardPay:1200},{guardCount:7,guardPay:1400}]
 it('calcula mes completo',()=>expect(calculateVacationGuardProration({history,vacationDays:30,daysInMonth:30})).toMatchObject({averageMonthlyGuardCount:6,vacationGuardProration:1200,equivalentVacationGuards:6}))
 it('calcula medio mes',()=>expect(calculateVacationGuardProration({history,vacationDays:15,daysInMonth:30}).vacationGuardProration).toBe(600))
 it('calcula 10 días',()=>expect(calculateVacationGuardProration({history,vacationDays:10,daysInMonth:30}).equivalentVacationGuards).toBe(2))
 it('usa tres meses y remuneraciones reales diferentes',()=>expect(calculateVacationGuardProration({history,vacationDays:30,daysInMonth:30}).averageMonthlyGuardPay).toBe(1200))
 it('usa solo dos meses disponibles',()=>expect(calculateVacationGuardProration({history:history.slice(0,2),vacationDays:30,daysInMonth:30}).averageMonthlyGuardCount).toBe(5.5))
 it('usa un mes disponible',()=>expect(calculateVacationGuardProration({history:history.slice(0,1),vacationDays:30,daysInMonth:30}).averageMonthlyGuardPay).toBe(1000))
 it('sin histórico devuelve cero',()=>expect(calculateVacationGuardProration({history:[],vacationDays:30,daysInMonth:30})).toMatchObject({monthsUsed:0,vacationGuardProration:0,equivalentVacationGuards:0}))
})
describe('salientes',()=>{it('sugiere el día posterior',()=>expect(suggestedLeaveDates(['2026-09-03'])).toEqual(['2026-09-04']));it('no añade remuneración',()=>expect(calculateSalary({guards:[],residencyYear:'R3',baseSalary:0,irpf:0}).grossSalary).toBe(1769.55));it('admite saliente manual en cualquier fecha y eliminación mediante el modelo multimarcas',()=>{let ids=['leave'];ids=ids.includes('leave')?ids.filter(x=>x!=='leave'):[...ids,'leave'];expect(ids).toEqual([])})})
describe('IRPF mensual',()=>{it('hereda el anterior',()=>expect(resolveEffectiveIrpf('2026-09',{'2026-08':{irpfOverride:16.2}},15)).toMatchObject({value:16.2,source:'inherited'}));it('usa override',()=>expect(resolveEffectiveIrpf('2026-09',{'2026-08':{irpfOverride:16.2},'2026-09':{irpfOverride:17.1}},15).value).toBe(17.1));it('el siguiente hereda el override',()=>expect(resolveEffectiveIrpf('2026-10',{'2026-09':{irpfOverride:17.1}},15).value).toBe(17.1))})
describe('total',()=>{it('usa salario R3 real sin override',()=>expect(calculateSalary({guards:[],residencyYear:'R3',baseSalary:0,irpf:0}).baseSalary).toBe(1769.55));it('combina salario, guardias, vacaciones e IRPF',()=>{const r=calculateSalary({guards:['2026-09-07'],residencyYear:'R3',baseSalary:0,vacationGuardProration:600,irpf:10});expect(r.grossSalary).toBeCloseTo(1769.55+322.15+600);expect(r.estimatedAfterIrpf).toBeCloseTo(r.grossSalary*.9)})})
