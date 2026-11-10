import { notFound } from 'next/navigation';
import { SdkLab } from '@/features/recording/SdkLab';
export const dynamic = 'force-dynamic';
export default function RecordingLabPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <SdkLab />;
}
