import { notFound } from 'next/navigation';
import { SceneCapture } from '@/features/landing/SceneCapture';
export const dynamic = 'force-dynamic';
export default async function Capture({
  searchParams,
}: {
  searchParams: Promise<{ frame?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development' && process.env.MOTION_CAPTURE !== '1') notFound();
  const { frame } = await searchParams;
  return <SceneCapture frame={frame === 'hero' ? 'hero' : 'start'} />;
}
