import { pgTable, uuid, varchar, timestamp, integer, jsonb, text } from 'drizzle-orm/pg-core';

export const analysisJobs = pgTable('analysis_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  depth: varchar('depth', { length: 20 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  resultsSummary: jsonb('results_summary'),
  reliabilityScore: integer('reliability_score'),
  blockchainTxHash: varchar('blockchain_tx_hash', { length: 255 }),
  reportPath: varchar('report_path', { length: 500 }),
});