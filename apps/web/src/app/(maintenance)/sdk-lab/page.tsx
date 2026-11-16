import { notFound } from 'next/navigation';
import { SdkLab } from '@/features/recording/SdkLab';
import { WidgetLab } from '@/features/recording/WidgetLab';
export const dynamic = 'force-dynamic';
export default async function RecordingLabPage({
  searchParams,
}: {
  searchParams: Promise<{ widget?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (await searchParams).widget === '1' ? <WidgetLab /> : <SdkLab />;
}
