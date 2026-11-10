export type ProjectInput = { name: string; websiteUrl: string };
export type ProjectFields = Partial<Record<keyof ProjectInput, string>>;
export type ValidProject = { name: string; origin: string };
const hasControl = (value: string) => [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

export function validateProject(input: unknown): { value?: ValidProject; fields: ProjectFields } {
  const fields: ProjectFields = {};
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name || name.length > 80 || hasControl(name)) fields.name = 'Enter a project name between 1 and 80 characters.';
  const address = typeof raw.websiteUrl === 'string' ? raw.websiteUrl.trim() : '';
  let origin = '';
  try {
    if (!address || address.length > 2048 || /[\s\\]/.test(address) || hasControl(address)) throw new Error();
    // Bare domains default to HTTPS; HTTP must be explicit (including localhost).
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(address) ? address : `https://${address}`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname || url.hostname.endsWith('.')) throw new Error();
    if (!url.hostname.includes('.') && url.hostname !== 'localhost' && !url.hostname.startsWith('[')) throw new Error();
    origin = url.origin;
  } catch { fields.websiteUrl = 'Enter a website such as https://example.com or http://localhost:4173. Do not include login credentials.'; }
  return { fields, value: Object.keys(fields).length ? undefined : { name, origin } };
}
