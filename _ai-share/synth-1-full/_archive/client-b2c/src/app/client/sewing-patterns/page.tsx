import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { SewingPatternWorkspace } from '@/components/client/SewingPatternWorkspace';

export default function SewingPatternsPage() {
  return (
    <CabinetPageContent maxWidth="screen">
      <ClientCabinetSectionHeader />
      <SewingPatternWorkspace />
    </CabinetPageContent>
  );
}
