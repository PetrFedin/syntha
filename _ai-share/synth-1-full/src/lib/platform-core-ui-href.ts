/**
 * UI-слой: переписать href перед `<Link>` в components/platform.
 * При MODE=off — passthrough (см. coercePlatformCoreNativeHref).
 */

import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { coercePlatformCoreNativeHref } from '@/lib/platform-core-native-href';

export function platformCoreUiHref(
  href: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return coercePlatformCoreNativeHref(href, demo);
}

/** Несколько href за раз (peer strips, golden path). */
export function platformCoreUiHrefs<T extends Record<string, string>>(
  map: T,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): T {
  const out = { ...map };
  for (const key of Object.keys(out) as (keyof T)[]) {
    out[key] = platformCoreUiHref(out[key], demo) as T[keyof T];
  }
  return out;
}

export {
  coercePlatformCoreNativeHref,
  platformCoreNativeCheckoutHref,
  platformCoreNativeMatrixHref,
  platformCoreNativeShowroomHref,
} from '@/lib/platform-core-native-href';
