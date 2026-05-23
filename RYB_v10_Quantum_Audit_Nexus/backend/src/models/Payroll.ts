import { pgTable, uuid, varchar, integer, decimal, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const payrolls = pgTable('payrolls', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull(),
  employeeName: varchar('employee_name', { length: 255 }),
  fiscalCode: varchar('fiscal_code', { length: 16 }),
  month: integer('month'),
  year: integer('year'),
  ccnlCode: varchar('ccnl_code', { length: 50 }),
  level: varchar('level', { length: 20 }),
  grossSalary: decimal('gross_salary', { precision: 12, scale: 2 }),
  netSalary: decimal('net_salary', { precision: 12, scale: 2 }),
  inpsContribution: decimal('inps_contribution', { precision: 12, scale: 2 }),
  inailContribution: decimal('inail_contribution', { precision: 12, scale: 2 }),
  irpefWithheld: decimal('irpef_withheld', { precision: 12, scale: 2 }),
  tfrAccrued: decimal('tfr_accrued', { precision: 12, scale: 2 }),
  hoursWorked: decimal('hours_worked', { precision: 6, scale: 2 }),
  overtimeHours: decimal('overtime_hours', { precision: 6, scale: 2 }),
  overtimePay: decimal('overtime_pay', { precision: 12, scale: 2 }),
  extractionConfidence: decimal('extraction_confidence', { precision: 5, scale: 2 }),
  isReconstructed: boolean('is_reconstructed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});