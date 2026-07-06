/**
 * Wave 7 · физический архив retail/CRM peer UI (не pricelist/WSSI hub sections).
 * Файлы: `src/_archive/platform-core-legacy/components/platform/retail-crm/`
 * Stub-реэкспорты: `src/components/platform/*Retail*.tsx` — null в Article Spine.
 */

export const PLATFORM_CORE_WAVE7_RETAIL_CRM_ARCHIVE_PATHS = [
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandScCabinetRetailPeerStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandScLinesheetsRetailPeerStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandScShowroomRetailPeerStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandCoRegistryRetailOnboardingStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandCoAgentRepCoPeerStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/BrandDevMerchCoSpinePeerStrip.tsx',
  '_archive/platform-core-legacy/components/platform/retail-crm/ShopDevelopmentBridgeGreenfieldCrmStrip.tsx',
] as const;

export type PlatformCoreWave7RetailCrmArchivePath =
  (typeof PLATFORM_CORE_WAVE7_RETAIL_CRM_ARCHIVE_PATHS)[number];
