export type ResidencyYear = 'R1'|'R2'|'R3'|'R4'|'R5'
export type GuardType = 'weekday'|'saturday'|'holiday'|'special'
export interface SalaryRate { base:number; weekday:number; saturday:number; holiday:number; special:number }
export const salaryRates: Record<ResidencyYear,SalaryRate> = {
 R1:{base:1501.84,weekday:236.30,saturday:270.30,holiday:381.60,special:667.20},
 R2:{base:1621.87,weekday:279.14,saturday:313.14,holiday:442.08,special:788.16},
 R3:{base:1769.55,weekday:322.15,saturday:356.15,holiday:502.80,special:909.60},
 R4:{base:1917.23,weekday:365.16,saturday:399.16,holiday:563.52,special:1031.04},
 R5:{base:2064.90,weekday:365.16,saturday:399.16,holiday:563.52,special:1031.04},
}
