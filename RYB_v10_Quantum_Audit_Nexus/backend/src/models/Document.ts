import { pgTable, uuid, varchar, integer, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: integer('file_size'),
  pageCount: integer('page_count'),
  ocrConfidence: decimal('ocr_confidence', { precision: 5, scale: 2 }),
  rawExtraction: jsonb('raw_extraction'),
  createdAt: timestamp('created_at').defaultNow(),
});