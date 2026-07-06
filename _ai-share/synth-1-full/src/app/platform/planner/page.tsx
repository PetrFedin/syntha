import { Suspense } from 'react';
import { PlatformPlannerPageClient } from '@/components/platform/PlatformPlannerPageClient';

export default function PlatformPlannerPage() {
  return (
    <Suspense fallback={<div className="bg-bg-surface min-h-[calc(100vh-4rem)]" />}>
      <PlatformPlannerPageClient />
    </Suspense>
  );
}
