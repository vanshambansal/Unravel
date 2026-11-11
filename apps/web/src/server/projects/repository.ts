import { and, desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { projects, type Project } from '../db/schema.ts';
import type * as schema from '../db/schema.ts';

export interface ProjectRepository {
  list(ownerId: string): Promise<Project[]>;
  find(ownerId: string, id: string): Promise<Project | undefined>;
  create(ownerId: string, name: string, origin: string): Promise<Project | undefined>;
  update(ownerId: string, id: string, expected: ProjectSnapshot, next: ProjectSnapshot): Promise<Project | undefined>;
  remove(ownerId: string, id: string, expected: ProjectSnapshot): Promise<boolean>;
}
export type ProjectSnapshot = Pick<Project, 'name' | 'origin'>;

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
    async update(ownerId, id, expected, next) {
      const [project] = await db.update(projects).set(next).where(and(eq(projects.ownerId, ownerId), eq(projects.id, id), eq(projects.name, expected.name), eq(projects.origin, expected.origin))).returning();
      return project;
    },
    async remove(ownerId, id, expected) {
      const rows = await db.delete(projects).where(and(eq(projects.ownerId, ownerId), eq(projects.id, id), eq(projects.name, expected.name), eq(projects.origin, expected.origin))).returning({ id: projects.id });
      return rows.length > 0;
    },
  };
}
