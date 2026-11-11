// Only these public SDK settings cross the fixture's server/browser boundary.
export function fixtureConfiguration(env = process.env) {
  const projectId = env.UNRAVEL_PROJECT_ID?.trim() ?? '';
  const applicationOrigin = env.UNRAVEL_APPLICATION_ORIGIN?.trim() ?? '';
  const testOverrides = env.FIXTURE_ALLOW_TEST_CONFIG === '1';
  if (!projectId || !applicationOrigin) return { projectId: null, applicationOrigin: null, testOverrides, error: 'Set UNRAVEL_PROJECT_ID and UNRAVEL_APPLICATION_ORIGIN in fixtures/test-site/.env.local, then restart the fixture.' };
  try {
    const url = new URL(applicationOrigin);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId) || !['http:', 'https:'].includes(url.protocol) || url.origin !== applicationOrigin) throw new Error();
    return { projectId, applicationOrigin, testOverrides, error: null };
  } catch {
    return { projectId: null, applicationOrigin: null, testOverrides, error: 'Invalid public SDK configuration. Use a project UUID and an HTTP(S) Unravel origin without a path or credentials.' };
  }
}
