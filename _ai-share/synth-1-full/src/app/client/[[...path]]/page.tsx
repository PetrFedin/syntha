import { redirect } from 'next/navigation';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildPlatformCoreStrictRedirectUrl } from '@/lib/platform-core-strict-routes';

type Props = { params: Promise<{ path?: string[] }> };

/**
 * Catch-all gate: UI client-b2c перенесён в `_archive/client-b2c/`.
 * Platform Core v1 — редирект на hub; legacy deep-link — gate с query `archived=client-b2c`.
 */
export default async function ClientB2cArchiveCatchAllPage({ params }: Props) {
  const { path } = await params;
  const fromPath = path?.length ? `/client/${path.join('/')}` : '/client';
  if (isPlatformCoreMode()) {
    redirect(buildPlatformCoreStrictRedirectUrl(fromPath));
  }
  redirect(`/platform?archived=client-b2c&from=${encodeURIComponent(fromPath)}`);
}
