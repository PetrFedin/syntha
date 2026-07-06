import type { RfFederalSubjectOption } from '@/lib/production/workshop2-rf-federal-subjects';

export type SewingPlanPartnerRow = {
  id: string;
  label: string;
  capabilities?: string[];
  machines?: string[];
  materialsExpertise?: string[];
};

/** Отдельный контракт только контрагентов/предприятий пошива. */
export type Workshop2SewingContractorsPayload = {
  partners: SewingPlanPartnerRow[];
  source: {
    partners: 'b2b_json' | 'catalog_and_demo' | 'enterprise_and_b2b';
  };
};

/** Backward-compatible alias for older imports. */
export type Workshop2ContractorsPayload = Workshop2SewingContractorsPayload;

/** Ответ GET `/api/brand/sewing-plan-reference` — справочники для блока «Регион / контур пошива». */
export type Workshop2SewingPlanReferencePayload = {
  partners: SewingPlanPartnerRow[];
  /** То, что пришло из `RF_FEDERAL_SUBJECT_EXTRA_JSON` (до слияния). */
  rfSubjectExtras: RfFederalSubjectOption[];
  /** Базовый список ISO 3166-2:RU + extras, отсортировано по названию. */
  rfSubjects: RfFederalSubjectOption[];
  source: {
    partners: 'b2b_json' | 'catalog_and_demo' | 'enterprise_and_b2b';
    rfSubjects: 'base_only' | 'base_plus_extra';
  };
};
