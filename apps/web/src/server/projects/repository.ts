import { and, desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { projects, type Project } from '../db/schema.ts';
import type * as schema from '../db/schema.ts';

export interface ProjectRepository {
  list(ownerId: string): Promise<Project[]>;
  find(ownerId: string, id: string): Promise<Project | undefined>;
  create(ownerId: string, name: string, origin: string): Promise<Project | undefined>;
}

export function projectRepository(db: NodePgDatabase<typeof schema>): ProjectRepository {
  return {
    list: ownerId => db.select().from(projects).where(eq(projects.ownerId, ownerId)).orderBy(desc(projects.createdAt), desc(projects.id)),
    async find(ownerId, id) {
      const [project] = await db.select().from(projects).where(and(eq(projects.ownerId, ownerId), eq(projects.id, id))).limit(1);
      return project;
    },
    async create(ownerId, name, origin) {
      const [project] = await db.insert(projects).values({ ownerId, name, origin }).onConflictDoNothing({ target: [projects.ownerId, projects.origin] }).returning();
      return project;
    },
  };
}
