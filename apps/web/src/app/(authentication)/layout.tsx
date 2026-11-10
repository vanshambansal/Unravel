import { Suspense } from 'react';
import { WorkspaceProvider } from '@/features/workspace/Provider';
export const dynamic = 'force-dynamic';
export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><WorkspaceProvider>{children}</WorkspaceProvider></Suspense>;
}
