import { validateProject } from '../../features/projects/validation.ts';
import { ApplicationError } from '../errors.ts';
import type { ProjectRepository } from './repository.ts';
import type { ProjectSnapshot } from './repository.ts';

function snapshot(input: unknown, project: ProjectSnapshot): ProjectSnapshot {
  const expected =
    input && typeof input === 'object'
      ? ((input as Record<string, unknown>).expected as Partial<ProjectSnapshot> | undefined)
      : undefined;
  if (!expected || expected.name !== project.name || expected.origin !== project.origin)
    throw new ApplicationError(
      409,
      'This project changed since you opened it. Reload to review the latest settings.',
    );
  return { name: expected.name, origin: expected.origin };
}
function uniqueOrigin(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: string; constraint?: string; cause?: unknown };
  return (
    (value.code === '23505' && value.constraint === 'projects_owner_origin_unique') ||
    (value.cause !== error && uniqueOrigin(value.cause))
  );
}

function owner(subject: string | null): string {
  if (!subject) throw new ApplicationError(401, 'Sign in to continue.');
  return subject;
}
export function projectService(repository: ProjectRepository) {
  return {
    list(subject: string | null) {
      return repository.list(owner(subject));
    },
    async get(subject: string | null, id: string) {
      const ownerId = owner(subject);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
        throw new ApplicationError(404, 'Project not found.');
      const project = await repository.find(ownerId, id);
      // Unknown and foreign-owned projects are indistinguishable.
      if (!project) throw new ApplicationError(404, 'Project not found.');
      return project;
    },
    async getSetup(subject: string | null, id: string) {
      const ownerId = owner(subject);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
        throw new ApplicationError(404, 'Project not found.');
      const project = await repository.findSetup(ownerId, id);
      if (!project) throw new ApplicationError(404, 'Project not found.');
      return project;
    },
    async create(subject: string | null, input: unknown) {
      const ownerId = owner(subject);
      const { value, fields } = validateProject(input);
      if (!value) throw new ApplicationError(422, 'Check the highlighted fields.', fields);
      const project = await repository.create(ownerId, value.name, value.origin);
      if (!project)
        throw new ApplicationError(409, 'You already have a project for this website.', {
          websiteUrl: 'This website is already registered in your workspace.',
        });
      return project;
    },
    async update(subject: string | null, id: string, input: unknown) {
      const project = await this.get(subject, id);
      const expected = snapshot(input, project);
      const { value, fields } = validateProject(input);
      if (!value) throw new ApplicationError(422, 'Check the highlighted fields.', fields);
      try {
        const updated = await repository.update(project.ownerId, id, expected, value);
        if (!updated)
          throw new ApplicationError(
            409,
            'This project changed or was deleted. Reload before saving again.',
          );
        return updated;
      } catch (error) {
        if (uniqueOrigin(error))
          throw new ApplicationError(409, 'You already have a project for this website.', {
            websiteUrl: 'This website is already registered in your workspace.',
          });
        throw error;
      }
    },
    async remove(subject: string | null, id: string, input: unknown) {
      const project = await this.get(subject, id);
      const expected = snapshot(input, project);
      if ((input as Record<string, unknown>).confirmation !== project.name)
        throw new ApplicationError(
          422,
          'Type the current project name exactly to confirm deletion.',
          { confirmation: 'The project name does not match.' },
        );
      if (!(await repository.remove(project.ownerId, id, expected)))
        throw new ApplicationError(
          409,
          'This project changed or was deleted. Reload before deleting.',
        );
    },
  };
}
