import { redirect } from 'next/navigation';

type Props = { params: Promise<{ brandId: string }> };

/** Runway tab — архив; редирект на gate профиля. */
export default async function BrandPublicRunwayArchiveGatePage({ params }: Props) {
  const { brandId } = await params;
  redirect(`/b/${encodeURIComponent(brandId)}`);
}
