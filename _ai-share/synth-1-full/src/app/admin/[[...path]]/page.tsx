import { redirect } from 'next/navigation';
import { buildPlatformCoreStrictRedirectUrl } from '@/lib/platform-core-strict-routes';

type Props = { params: Promise<{ path?: string[] }> };

export default async function AdminArchiveGatePage({ params }: Props) {
  const { path } = await params;
  const fromPath = path?.length ? `/admin/${path.join('/')}` : '/admin';
  redirect(buildPlatformCoreStrictRedirectUrl(fromPath));
}
