import { HomeAdminPanel } from '@/components/cms/admin/HomeAdminPanel';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function AdminHomePage() {
  return (
    <CabinetPageContent
      maxWidth="full"
      className="min-h-screen bg-[#fcfdfe] p-4 duration-700 animate-in fade-in md:p-4"
    >
      <HomeAdminPanel />
    </CabinetPageContent>
  );
}
