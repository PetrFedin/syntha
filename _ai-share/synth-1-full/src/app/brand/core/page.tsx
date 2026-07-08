import { PlatformCoreCabinetPage } from '@/components/platform/PlatformCoreCabinetPage';

export const dynamic = 'force-dynamic';

export default function BrandCoreCabinetPage() {
  return <PlatformCoreCabinetPage roleId="brand" fallbackHref="/platform" />;
}
