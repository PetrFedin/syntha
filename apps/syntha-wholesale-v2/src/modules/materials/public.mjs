import { invariant } from '../../core/errors.mjs';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{1,39}$/;
const COLOR_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,39}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MATERIAL_TYPES = new Set(['fabric', 'trim', 'label', 'packaging', 'artwork', 'other']);
const UNITS = new Set(['m', 'kg', 'pcs', 'pair', 'set']);

export function createMaterial({ id, brandId, code, name, type, createdAt }) {
  invariant(id, 'MATERIAL_ID_REQUIRED', 'Material id is required');
  invariant(brandId, 'MATERIAL_BRAND_REQUIRED', 'Material brand is required');
  const normalizedType = String(type ?? '').trim().toLowerCase();
  invariant(MATERIAL_TYPES.has(normalizedType), 'MATERIAL_TYPE_INVALID', 'Material type is invalid', { type });
  return Object.freeze({
    id,
    brandId,
    code: normalizeCode(code, 'MATERIAL_CODE_INVALID'),
    name: normalizeText(name, 'MATERIAL_NAME_REQUIRED', 'Material name is required', 120),
    type: normalizedType,
    status: 'active',
    version: 1,
    createdAt,
    updatedAt: createdAt,
  });
}

export function createMaterialRevision({ id, material, revisionNumber, specification, createdAt }) {
  invariant(id, 'MATERIAL_REVISION_ID_REQUIRED', 'Material revision id is required');
  invariant(material?.id, 'MATERIAL_REQUIRED', 'Material is required');
  invariant(Number.isInteger(revisionNumber) && revisionNumber > 0, 'MATERIAL_REVISION_NUMBER_INVALID', 'Material revision number must be a positive integer');
  return freezeRevision({
    id,
    materialId: material.id,
    brandId: material.brandId,
    materialCode: material.code,
    materialName: material.name,
    materialType: material.type,
    revisionNumber,
    status: 'draft',
    specification: normalizeSpecification(material.type, specification),
    version: 1,
    approvedAt: null,
    supersededAt: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function createNextMaterialRevision({ id, material, approvedRevision, changes = {}, createdAt }) {
  invariant(approvedRevision?.status === 'approved', 'APPROVED_MATERIAL_REVISION_REQUIRED', 'A current approved material revision is required');
  invariant(approvedRevision.materialId === material?.id, 'MATERIAL_REVISION_MATERIAL_MISMATCH', 'Material revision belongs to another material');
  return createMaterialRevision({
    id,
    material,
    revisionNumber: approvedRevision.revisionNumber + 1,
    specification: { ...approvedRevision.specification, ...changes },
    createdAt,
  });
}

export function approveMaterialRevision(revision, approvedAt) {
  invariant(revision?.status === 'draft', 'MATERIAL_REVISION_NOT_DRAFT', 'Only a draft material revision can be approved', {
    revisionId: revision?.id,
    status: revision?.status,
  });
  return freezeRevision({ ...revision, status: 'approved', version: revision.version + 1, approvedAt, updatedAt: approvedAt });
}

export function supersedeMaterialRevision(revision, supersededAt) {
  invariant(revision?.status === 'approved', 'MATERIAL_REVISION_NOT_APPROVED', 'Only an approved material revision can be superseded', {
    revisionId: revision?.id,
    status: revision?.status,
  });
  return freezeRevision({ ...revision, status: 'superseded', version: revision.version + 1, supersededAt, updatedAt: supersededAt });
}

function normalizeSpecification(materialType, input = {}) {
  const uom = String(input.uom ?? '').trim().toLowerCase();
  invariant(UNITS.has(uom), 'MATERIAL_UOM_INVALID', 'Material unit of measure is invalid', { uom: input.uom });
  const currency = String(input.currency ?? '').trim().toUpperCase();
  invariant(CURRENCY_PATTERN.test(currency), 'MATERIAL_CURRENCY_INVALID', 'Material currency must be a three-letter ISO code');
  invariant(Number.isSafeInteger(input.unitCostMinor) && input.unitCostMinor >= 0, 'MATERIAL_UNIT_COST_INVALID', 'Material unit cost must be a non-negative integer in minor currency units');
  invariant(Number.isInteger(input.leadTimeDays) && input.leadTimeDays >= 0 && input.leadTimeDays <= 3650, 'MATERIAL_LEAD_TIME_INVALID', 'Material lead time must be between 0 and 3650 days');
  const composition = normalizeOptionalText(input.composition, 500);
  if (materialType === 'fabric') invariant(composition.length >= 2, 'MATERIAL_COMPOSITION_REQUIRED', 'Fabric composition is required');
  const colorCode = String(input.colorCode ?? '').trim().toUpperCase();
  invariant(!colorCode || COLOR_CODE_PATTERN.test(colorCode), 'MATERIAL_COLOR_CODE_INVALID', 'Material color code is invalid');
  return Object.freeze({
    uom,
    composition,
    colorCode: colorCode || null,
    supplierName: normalizeOptionalText(input.supplierName, 120) || null,
    unitCostMinor: input.unitCostMinor,
    currency,
    leadTimeDays: input.leadTimeDays,
  });
}

function normalizeCode(value, code) {
  const normalized = String(value ?? '').trim().toUpperCase();
  invariant(CODE_PATTERN.test(normalized), code, 'Code must contain 2-40 uppercase letters, numbers, dots, underscores or dashes');
  return normalized;
}

function normalizeText(value, code, message, maxLength) {
  const normalized = String(value ?? '').trim();
  invariant(normalized.length >= 2 && normalized.length <= maxLength, code, message);
  return normalized;
}

function normalizeOptionalText(value, maxLength) {
  const normalized = String(value ?? '').trim();
  invariant(normalized.length <= maxLength, 'MATERIAL_TEXT_TOO_LONG', 'Material text value is too long', { maxLength });
  return normalized;
}

function freezeRevision(value) {
  return Object.freeze({ ...value, specification: Object.freeze({ ...value.specification }) });
}
