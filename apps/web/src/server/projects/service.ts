import { validateProject } from '../../features/projects/validation.ts';
import { ApplicationError } from '../errors.ts';
import type { ProjectRepository } from './repository.ts';

function owner(subject: string | null): string {
  if (!subject) throw new ApplicationError(401, 'Sign in to continue.');
  return subject;
}
export function projectService(repository: ProjectRepository) {
  return {
    list(subject: string | null) { return repository.list(owner(subject)); },
    async get(subject: string | null, id: string) {
      const ownerId = owner(subject);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new ApplicationError(404, 'Project not found.');
      const project = await repository.find(ownerId, id);
      // Unknown and foreign-owned projects are indistinguishable.
      if (!project) throw new ApplicationError(404, 'Project not found.');
      return project;
    },
    async create(subject: string | null, input: unknown) {
      const ownerId = owner(subject);
      const { value, fields } = validateProject(input);
      if (!value) throw new ApplicationError(422, 'Check the highlighted fields.', fields);
      const project = await repository.create(ownerId, value.name, value.origin);
      if (!project) throw new ApplicationError(409, 'You already have a project for this website.', { websiteUrl: 'This website is already registered in your workspace.' });
      return project;
    },
  };
}
