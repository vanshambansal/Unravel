import { check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import type { Recording, ReplayEvent, SemanticEvent } from '@unravel/contracts';
import { sql } from 'drizzle-orm';
import type { TestPlan } from '@unravel/test-plan';

// Clerk owns accounts. Keep only its stable subject, not duplicate email/password data.
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  origin: text('origin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('projects_owner_origin_unique').on(table.ownerId, table.origin),
  index('projects_owner_created_index').on(table.ownerId, table.createdAt),
  check('projects_name_length', sql`char_length(${table.name}) between 1 and 80`),
  check('projects_owner_not_empty', sql`char_length(${table.ownerId}) > 0`),
]);
export type Project = typeof projects.$inferSelect;

// Retain a minimal intake tombstone; account closure never deletes captured evidence.
export const accountIntakeBlocks = pgTable('account_intake_blocks', {
  ownerId: text('owner_id').primaryKey(),
  receivedAt: timestamp('received_at', {withTimezone:true}).notNull().defaultNow(),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  recordingId: uuid('recording_id').notNull(),
  title: text('title').notNull(), description: text('description').notNull(),
  status: text('status').$type<'open' | 'resolved'>().notNull().default('open'),
  revision: integer('revision').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  digest: text('digest').notNull(), bytes: integer('bytes').notNull(), eventCount: integer('event_count').notNull(),
  recording: jsonb('recording').$type<Omit<Recording, 'replay' | 'events'>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('reports_project_recording_unique').on(table.projectId, table.recordingId),
  index('reports_project_created_index').on(table.projectId, table.createdAt),
  index('reports_project_status_created_index').on(table.projectId, table.status, table.createdAt, table.id),
  check('reports_status_valid', sql`${table.status} in ('open', 'resolved')`),
  check('reports_revision_positive', sql`${table.revision} > 0`),
  check('reports_title_length', sql`char_length(${table.title}) between 1 and 120`),
  check('reports_description_length', sql`char_length(${table.description}) <= 2000`),
  check('reports_bounded_bytes', sql`${table.bytes} between 1 and 5000000`),
]);
export const reportPayloads = pgTable('report_payloads', {
  reportId: uuid('report_id').primaryKey().references(() => reports.id, { onDelete: 'cascade' }),
  replay: jsonb('replay').$type<ReplayEvent[]>().notNull(),
  events: jsonb('events').$type<SemanticEvent[]>().notNull(),
});
export type Report = typeof reports.$inferSelect;
export const ingestionBudgets = pgTable('ingestion_budgets', {
  projectId: uuid('project_id').primaryKey().references(() => projects.id, { onDelete: 'cascade' }),
  minute: timestamp('minute', { withTimezone: true }).notNull(),
  minuteCount: integer('minute_count').notNull(),
  day: timestamp('day', { withTimezone: true }).notNull(),
  dayCount: integer('day_count').notNull(),
});
export const reportTestPlans = pgTable('report_test_plans', {
  reportId: uuid('report_id').primaryKey().references(() => reports.id, { onDelete: 'cascade' }),
  plan: jsonb('plan').$type<TestPlan>().notNull(),
  revision: integer('revision').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [check('report_test_plan_revision', sql`${table.revision} > 0`)]);
