/**
 * Demo-context href/label rewrite helpers for hub matrix.
 * Extracted from platform-core-hub-matrix.ts — no business rules.
 */
import {
  type PlatformCoreDemoContext,
  PLATFORM_CORE_COLLECTION_PRESETS,
  PLATFORM_CORE_DEMO,
  PLATFORM_CORE_DEMO_PRESETS,
  getPlatformCoreCollectionLabel,
} from '@/lib/platform-core-demo-context';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { coercePlatformCoreNativeHref } from '@/lib/platform-core-native-href';

/** Подмена SS27/FW27 id в href матрицы под выбранную коллекцию. */
export function rewriteHrefForDemo(
  href: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  let out = href;
  for (const preset of Object.values(PLATFORM_CORE_DEMO_PRESETS)) {
    if (
      preset.collectionId === demo.collectionId &&
      preset.demoOrderId === demo.demoOrderId &&
      preset.demoArticleId === demo.demoArticleId
    ) {
      continue;
    }
    const pairs: [string, string][] = [
      [preset.productionOrderId, demo.productionOrderId],
      [preset.demoOrderId, demo.demoOrderId],
      [preset.demoArticleId, demo.demoArticleId],
      [preset.collectionId, demo.collectionId],
    ];
    for (const [from, to] of pairs) {
      if (from !== to && out.includes(from)) {
        out = out.split(from).join(to);
      }
    }
  }
  if (isPlatformCoreMode()) {
    out = coercePlatformCoreNativeHref(out, demo);
  }
  return out;
}

/** Подмена id коллекции в подписях hub/кабинетов. */
export function rewriteLabelForDemo(
  label: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  let out = label;
  for (const preset of Object.values(PLATFORM_CORE_DEMO_PRESETS)) {
    if (preset.collectionId !== demo.collectionId && out.includes(preset.collectionId)) {
      out = out.split(preset.collectionId).join(demo.collectionId);
    }
    if (preset.demoOrderId !== demo.demoOrderId && out.includes(preset.demoOrderId)) {
      out = out.split(preset.demoOrderId).join(demo.demoOrderId);
    }
    if (
      preset.productionOrderId !== demo.productionOrderId &&
      out.includes(preset.productionOrderId)
    ) {
      out = out.split(preset.productionOrderId).join(demo.productionOrderId);
    }
    if (preset.demoArticleId !== demo.demoArticleId && out.includes(preset.demoArticleId)) {
      out = out.split(preset.demoArticleId).join(demo.demoArticleId);
    }
    if (preset.factoryId !== demo.factoryId && out.includes(preset.factoryId)) {
      out = out.split(preset.factoryId).join(demo.factoryId);
    }
    if (preset.factoryHubId !== demo.factoryHubId && out.includes(preset.factoryHubId)) {
      out = out.split(preset.factoryHubId).join(demo.factoryHubId);
    }
  }
  const targetCollectionLabel = getPlatformCoreCollectionLabel(demo.collectionId);
  for (const preset of PLATFORM_CORE_COLLECTION_PRESETS) {
    if (preset.id === demo.collectionId) continue;
    if (preset.label !== targetCollectionLabel && out.includes(preset.label)) {
      out = out.split(preset.label).join(targetCollectionLabel);
    }
  }
  return out;
}

/** Подмена id коллекции в подписях hub/кабинетов. */
export function rewriteHubTextForDemo(
  text: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return rewriteLabelForDemo(text, demo);
}
