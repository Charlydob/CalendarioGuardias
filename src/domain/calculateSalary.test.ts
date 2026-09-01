import { describe,expect,it } from 'vitest'
import { calculateSalary, classifyGuard } from './calculateSalary'

describe('clasificación de guardias',()=>{
 it('clasifica lunes y viernes normales',()=>{expect(classifyGuard('2026-09-07')).toBe('weekday');expect(classifyGuard('2026-09-04')).toBe('weekday')})
 it('clasifica sábado',()=>expect(classifyGuard('2026-09-05')).toBe('saturday'))
 it('clasifica domingo',()=>expect(classifyGuard('2026-09-06')).toBe('holiday'))
 it('clasifica festivo entre semana',()=>expect(classifyGuard('2026-10-09')).toBe('holiday'))
 it('prioriza festivo oficial que cae en sábado',()=>expect(classifyGuard('2026-08-15')).toBe('holiday'))
 it('prioriza festivo especial',()=>expect(classifyGuard('2026-09-05',['2026-09-05'])).toBe('special'))
})
describe('cálculo salarial',()=>{
 it.each([['R1',236.30],['R3',322.15],['R5',365.16]] as const)('aplica tarifa %s',(residencyYear,amount)=>{const r=calculateSalary({guards:['2026-09-07'],residencyYear,baseSalary:0,irpf:0});expect(r.guardPayments).toBeCloseTo(amount)})
 it('calcula IRPF',()=>{const r=calculateSalary({guards:[],residencyYear:'R1',baseSalary:2000,irpf:15});expect(r.irpfAmount).toBe(300);expect(r.estimatedAfterIrpf).toBe(1700)})
 it('suma varias guardias y salario base',()=>{const r=calculateSalary({guards:['2026-09-04','2026-09-05','2026-09-06'],residencyYear:'R3',baseSalary:1769.55,irpf:0});expect(r.guardPayments).toBeCloseTo(322.15+356.15+502.80);expect(r.grossSalary).toBeCloseTo(2950.65)})
})
