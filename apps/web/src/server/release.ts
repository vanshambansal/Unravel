import { validReplayOrigin } from '../features/reports/replay-origin.ts';
type Environment = Record<string, string | undefined>;
export const loopback = (host: string) => ['localhost', '127.0.0.1', '[::1]'].includes(host);
export function releaseIssues(env: Environment) {
  const issues: string[] = [];
  let app: URL | undefined;
  try {
    app = new URL(env.APP_ORIGIN ?? '');
    if (app.origin !== env.APP_ORIGIN || app.protocol !== 'https:' || loopback(app.hostname))
      throw Error();
  } catch {
    issues.push('APP_ORIGIN must be a canonical public HTTPS origin.');
  }
  if (
    !app ||
    !validReplayOrigin(env.REPLAY_ORIGIN ?? '', app.origin) ||
    !env.REPLAY_ORIGIN?.startsWith('https:')
  )
    issues.push('REPLAY_ORIGIN must be an isolated HTTPS origin on a different hostname.');
  if (env.EDGE_INGESTION_PROTECTED !== 'true')
    issues.push(
      'Confirm deployment edge request-size, rate, concurrency and timeout controls with EDGE_INGESTION_PROTECTED=true.',
    );
  if (env.PUBLIC_PRIVACY_REVIEWED !== 'true' || env.REPORT_RETENTION_POLICY !== 'owner-managed')
    issues.push(
      'Review masking, owner-managed retention/backups and visitor disclosure; configure PUBLIC_PRIVACY_REVIEWED and REPORT_RETENTION_POLICY.',
    );
  if (!env.CLERK_WEBHOOK_SIGNING_SECRET?.startsWith('whsec_'))
    issues.push(
      'Configure signed user.deleted webhook delivery and verify account intake blocking.',
    );
  if (
    !env.CLERK_SECRET_KEY?.startsWith('sk_live_') ||
    !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')
  )
    issues.push(
      'Configure and manually verify Clerk production authentication, allowed URLs and passwordless signup.',
    );
  return issues;
}
export function ingestionAllowed(url: string, env: Environment = process.env) {
  const address = new URL(url);
  if (loopback(address.hostname) && env.PUBLIC_INGESTION_ENABLED !== 'true')
    return env.NODE_ENV !== 'production' || env.ALLOW_LOOPBACK_INGESTION === 'true';
  return (
    env.PUBLIC_INGESTION_ENABLED === 'true' &&
    url.startsWith(`${env.APP_ORIGIN}/`) &&
    releaseIssues(env).length === 0
  );
}
