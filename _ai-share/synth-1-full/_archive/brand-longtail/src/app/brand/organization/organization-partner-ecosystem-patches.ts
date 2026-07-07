import type { PartnerCountApiPatch } from './organization-partner-counts';
import type { PartnerProcessApiPatch } from './organization-partner-processes';
import type { PartnerEcosystemBlockApiPatch } from './organization-partner-ecosystem-blocks';

/** Поддержка partnerEcosystem из ответа dashboard (unknown → безопасный доступ). */
export function pickPartnerEcosystemPatches(partnerEcosystem: unknown): {
  countsPatchById: Record<string, PartnerCountApiPatch> | undefined;
  growthByPeriod: unknown;
  businessProcessesPatchById: Record<string, PartnerProcessApiPatch> | undefined;
  ecosystemBlocksPatchById: Record<string, PartnerEcosystemBlockApiPatch> | undefined;
} {
  if (!partnerEcosystem || typeof partnerEcosystem !== 'object') {
    return {
      countsPatchById: undefined,
      growthByPeriod: undefined,
      businessProcessesPatchById: undefined,
      ecosystemBlocksPatchById: undefined,
    };
  }
  const o = partnerEcosystem as Record<string, unknown>;
  const rawPatches = o.countsPatchById;
  const countsPatchById =
    rawPatches && typeof rawPatches === 'object'
      ? (rawPatches as Record<string, PartnerCountApiPatch>)
      : undefined;
  const rawBp = o.businessProcessesPatchById;
  const businessProcessesPatchById =
    rawBp && typeof rawBp === 'object'
      ? (rawBp as Record<string, PartnerProcessApiPatch>)
      : undefined;
  const rawEb = o.ecosystemBlocksPatchById;
  const ecosystemBlocksPatchById =
    rawEb && typeof rawEb === 'object'
      ? (rawEb as Record<string, PartnerEcosystemBlockApiPatch>)
      : undefined;
  return {
    countsPatchById,
    growthByPeriod: o.growthByPeriod,
    businessProcessesPatchById,
    ecosystemBlocksPatchById,
  };
}
