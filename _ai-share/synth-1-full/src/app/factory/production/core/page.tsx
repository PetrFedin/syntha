import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { PlatformCoreCabinetPage } from '@/components/platform/PlatformCoreCabinetPage';
import { ROUTES } from '@/lib/routes';

export const dynamic = 'force-dynamic';

export default function ManufacturerCoreCabinetPage() {
  return <PlatformCoreCabinetPage roleId="manufacturer" fallbackHref={EXTENDED_ROUTES.factory.production} />;
}
