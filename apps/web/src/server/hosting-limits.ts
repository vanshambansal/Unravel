import { MAX_SUBMISSION_BYTES } from '@unravel/contracts';
import { ApplicationError } from './errors.ts';

// Leave room below Vercel's 4.5 MB function request/response ceiling.
export function submissionByteLimit(env = process.env) {
  return env.VERCEL === '1' ? 4_000_000 : MAX_SUBMISSION_BYTES;
}

export function assertHostedResponseFits(text: string, env = process.env) {
  if (env.VERCEL === '1' && Buffer.byteLength(text, 'utf8') > 4_000_000)
    throw new ApplicationError(
      413,
      'This older recording exceeds the hosted replay size limit. Its evidence remains stored; use the local application to view it.',
    );
}
