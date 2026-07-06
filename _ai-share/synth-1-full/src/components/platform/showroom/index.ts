/** Native showroom widgets — zero imports from components/shop/b2b. */
export { ShopShowroomCoverHeroStrip } from './ShopShowroomCoverHeroStrip';
export { ShopShowroomCoverHeroPriorityStrip } from './ShopShowroomCoverHeroPriorityStrip';
export { ShopShowroomPartnerLogoSourceBadge } from './ShopShowroomPartnerLogoSourceBadge';
export { ShopShowroomInlineQtyControl } from './ShopShowroomInlineQtyControl';
export {
  PlatformCoreEmpty27OnboardingStrip,
  ShopScEmpty27OnboardingStrip,
} from './PlatformCoreEmpty27OnboardingStrip';
export { PlatformCoreShowroomBuyerProfileStrip } from './PlatformCoreShowroomBuyerProfileStrip';
export { PlatformCoreShowroom3dStreamPanel } from './PlatformCoreShowroom3dStreamPanel';

import dynamic from 'next/dynamic';

export const PlatformCoreShowroom3dStreamPanelLazy = dynamic(
  () =>
    import('./PlatformCoreShowroom3dStreamPanel').then((m) => ({
      default: m.PlatformCoreShowroom3dStreamPanel,
    })),
  { ssr: false }
);

/** @deprecated alias */
export const B2b3dStreamPanelLazy = PlatformCoreShowroom3dStreamPanelLazy;
