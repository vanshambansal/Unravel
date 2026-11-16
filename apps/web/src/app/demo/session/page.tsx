import { ClerkProvider } from '@clerk/nextjs';
import { authConfigured } from '@/server/auth';
import { DemoSession, DemoSessionUnavailable } from '@/features/demo/DemoSession';

export default function DemoSessionPage() {
  if (!authConfigured()) return <DemoSessionUnavailable />;
  return (
    <ClerkProvider>
      <DemoSession />
    </ClerkProvider>
  );
}
