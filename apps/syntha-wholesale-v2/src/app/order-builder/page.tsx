import type { Metadata } from 'next';

import { OrderWorkspacePage } from '@/shared/workspace/components/order-workspace-page';

export const metadata: Metadata = {
  title: 'Order Builder',
  description: 'Buyer-private Draft Orders created from READY Selections.',
};

export default function OrderBuilderPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <OrderWorkspacePage
      sectionId="order-builder"
      mode="builder"
      searchParams={searchParams}
    />
  );
}
