import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { brands } from '@/lib/placeholder-data';
import { getB2BOrdersBaseForOperationalApi } from '@/lib/order/b2b-orders-list-read-model.server';
import {
  RF_FEDERAL_SUBJECT_OPTIONS,
  type RfFederalSubjectOption,
} from '@/lib/production/workshop2-rf-federal-subjects';
import { SEWING_ENTERPRISE_PARTNER_OPTIONS } from '@/lib/production/workshop2-sewing-enterprise-partners';
import {
  type SewingPlanPartnerRow,
  type Workshop2SewingContractorsPayload,
  type Workshop2SewingPlanReferencePayload,
} from '@/lib/production/workshop2-sewing-plan-reference-types';
import { partnerRowsFromB2bOrderShops } from '@/lib/production/workshop2-sewing-plan-partners-from-b2b';

function parsePartnersJson(raw: string | undefined): SewingPlanPartnerRow[] | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return null;
    const out: SewingPlanPartnerRow[] = [];
    for (const row of j) {
      if (!row || typeof row !== 'object') continue;
      const id = String((row as { id?: unknown }).id ?? '').trim();
      const label = String((row as { label?: unknown }).label ?? '').trim();
      const capabilities = Array.isArray((row as { capabilities?: unknown }).capabilities)
        ? ((row as { capabilities?: unknown }).capabilities as string[])
        : undefined;
      const machines = Array.isArray((row as { machines?: unknown }).machines)
        ? ((row as { machines?: unknown }).machines as string[])
        : undefined;
      const materialsExpertise = Array.isArray(
        (row as { materialsExpertise?: unknown }).materialsExpertise
      )
        ? ((row as { materialsExpertise?: unknown }).materialsExpertise as string[])
        : undefined;
      if (id && label) out.push({ id, label, capabilities, machines, materialsExpertise });
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function parseRfSubjectExtrasJson(raw: string | undefined): RfFederalSubjectOption[] {
  if (!raw?.trim()) return [];
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    const out: RfFederalSubjectOption[] = [];
    for (const row of j) {
      if (!row || typeof row !== 'object') continue;
      const iso31662 = String((row as { iso31662?: unknown }).iso31662 ?? '').trim();
      const name = String((row as { name?: unknown }).name ?? '').trim();
      if (iso31662 && name) out.push({ iso31662, name });
    }
    return out;
  } catch {
    return [];
  }
}

function mergeRfSubjects(
  base: readonly RfFederalSubjectOption[],
  extras: RfFederalSubjectOption[]
) {
  const map = new Map(base.map((o) => [o.iso31662, { ...o }]));
  for (const e of extras) {
    map.set(e.iso31662, { iso31662: e.iso31662, name: e.name });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function resolveWorkshop2SewingContractorsPayload(): Workshop2SewingContractorsPayload {
  const fromEnvPartners = parsePartnersJson(process.env.B2B_SEWING_PARTNERS_JSON);
  const coreMode = isPlatformCoreMode();
  const fromBrands = brands.map((b) => ({
    id: `b2b:${String(b.slug).trim()}`,
    label: String(b.name ?? b.slug).trim() || b.slug,
  }));

  if (fromEnvPartners) {
    return {
      partners: [...fromEnvPartners].sort((a, b) => a.label.localeCompare(b.label, 'ru')),
      source: { partners: 'b2b_json' },
    };
  }

  const map = new Map<string, SewingPlanPartnerRow>();
  if (!coreMode) {
    for (const p of fromBrands) {
      map.set(p.id, p);
    }
  }
  for (const p of SEWING_ENTERPRISE_PARTNER_OPTIONS) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  for (const p of partnerRowsFromB2bOrderShops(getB2BOrdersBaseForOperationalApi())) {
    if (!map.has(p.id)) map.set(p.id, p);
  }

  return {
    partners: [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    source: { partners: coreMode ? 'enterprise_and_b2b' : 'catalog_and_demo' },
  };
}

export function resolveWorkshop2SewingPlanReferencePayload(): Workshop2SewingPlanReferencePayload {
  const contractors = resolveWorkshop2SewingContractorsPayload();
  const extras = parseRfSubjectExtrasJson(process.env.RF_FEDERAL_SUBJECT_EXTRA_JSON);
  const rfMerged = mergeRfSubjects(RF_FEDERAL_SUBJECT_OPTIONS, extras);

  return {
    partners: contractors.partners,
    rfSubjectExtras: extras,
    rfSubjects: rfMerged,
    source: {
      partners: contractors.source.partners,
      rfSubjects: extras.length ? 'base_plus_extra' : 'base_only',
    },
  };
}
