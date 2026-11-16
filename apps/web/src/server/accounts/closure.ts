import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { accountIntakeBlocks, projects } from '../db/schema.ts';
import type * as schema from '../db/schema.ts';

export async function blockAccountIntake(db: NodePgDatabase<typeof schema>, ownerId: string) {
  if (!/^user_[A-Za-z0-9_-]{1,120}$/.test(ownerId)) throw Error('Invalid account identifier.');
  await db.transaction(async (tx) => {
    // Match ingestion's project lock before acknowledgement; already admitted requests
    // may finish before the webhook, but none are admitted after it commits.
    await tx
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .orderBy(projects.id)
      .for('update');
    await tx.insert(accountIntakeBlocks).values({ ownerId }).onConflictDoNothing();
  });
}
