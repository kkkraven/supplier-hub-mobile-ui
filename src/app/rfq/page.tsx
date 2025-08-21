import { Suspense } from 'react';
import { RFQListClient } from '@/components/rfq/rfq-list-client';
import { RFQListSkeleton } from '@/components/rfq/rfq-list-skeleton';

export default function RFQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<RFQListSkeleton />}>
        <RFQListClient />
      </Suspense>
    </div>
  );
}
