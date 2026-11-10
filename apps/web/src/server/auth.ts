import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { ApplicationError } from './errors.ts';
import { redirect } from 'next/navigation';
import { clerkKeysHaveValidFormat } from '../features/authentication/configuration.ts';

export function authConfigured() { return clerkKeysHaveValidFormat(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY); }
export async function requireDeveloper() {
  if (!authConfigured()) throw new ApplicationError(503, 'Developer sign-in is not configured yet.');
  const { userId } = await auth();
  if (!userId) throw new ApplicationError(401, 'Sign in to continue.');
  return userId;
}
export async function requirePageDeveloper() {
  try { return await requireDeveloper(); }
  catch (error) { if (error instanceof ApplicationError && [401, 503].includes(error.status)) redirect('/sign-in'); throw error; }
}
