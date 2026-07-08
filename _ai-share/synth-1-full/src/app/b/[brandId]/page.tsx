import { redirect } from 'next/navigation';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ROUTES } from '@/lib/platform-core-routes';

type Props = { params: Promise<{ brandId: string }> };

/**
 * Публичный профиль бренда перенесён в `_archive/brand-public`.
 * Platform Core: витрина опта вместо marketing `/b/*`.
 */
export default async function BrandPublicArchiveGatePage({ params }: Props) {
  const { brandId } = await params;
  if (isPlatformCoreMode()) {
    const sp = new URLSearchParams({ brand: brandId });
    redirect(`${ROUTES.shop.b2bShowroom}?${sp.toString()}`);
  }
  redirect(`/platform?archived=brand-public&brand=${encodeURIComponent(brandId)}`);
}
