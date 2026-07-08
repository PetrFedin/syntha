import B2BOrderDetailsPage from '@/app/brand/b2b-orders/[orderId]/page';

export default function DistributorB2BOrderDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return <B2BOrderDetailsPage params={paramsPromise} />;
}
