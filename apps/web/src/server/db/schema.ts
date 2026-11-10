import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
