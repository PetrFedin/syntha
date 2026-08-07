import { invariant } from '../../core/errors.mjs';

const COMPONENT_KEY_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,39}$/;
const MICROS_PER_UNIT = 1_000_000n;
const BASIS_POINTS = 10_000n;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

export function createBom({ id, style, collection, revisionNumber, sourceBom, createdAt }) {
  invariant(id, 'BOM_ID_REQUIRED', 'BOM id is required');
  invariant(style?.id, 'BOM_STYLE_REQUIRED', 'BOM Style is required');
  invariant(style.status === 'approved', 'BOM_STYLE_NOT_APPROVED', 'BOM requires an approved Style', { styleId: style.id, status: style.status });
  invariant(collection?.id === style.collectionId, 'BOM_COLLECTION_MISMATCH', 'BOM collection must match Style collection');
  invariant(collection.brandId === style.brandId, 'BOM_BRAND_MISMATCH', 'BOM brand must match Style brand');
  invariant(Number.isInteger(revisionNumber) && revisionNumber > 0, 'BOM_REVISION_NUMBER_INVALID', 'BOM revision number must be a positive integer');
  if (sourceBom) {
    invariant(sourceBom.status === 'approved', 'APPROVED_BOM_REQUIRED', 'BOM revision requires an approved source BOM');
    invariant(sourceBom.styleId === style.id, 'BOM_SOURCE_STYLE_MISMATCH', 'Source BOM belongs to another Style');
    invariant(sourceBom.revisionNumber + 1 === revisionNumber, 'BOM_REVISION_SEQUENCE_INVALID', 'BOM revisions must be sequential');
  }
  const lines = sourceBom ? sourceBom.lines.map(cloneLine) : [];
  return freezeBom({
    id,
    brandId: style.brandId,
    collectionId: style.collectionId,
    styleId: style.id,
    styleCode: style.styleCode,
    styleVersion: style.version,
    revisionNumber,
    status: 'draft',
    currency: collection.currency,
    lines,
    materialCostMinor: sumMaterialCost(lines),
    version: 1,
    submittedAt: null,
    approvedAt: null,
    supersededAt: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function upsertBomLine(bom, {
  componentKey,
  componentRole,
  materialRevision,
  consumptionMicrounits,
  wasteBasisPoints = 0,
}, updatedAt) {
  assertDraftBom(bom);
  invariant(materialRevision?.status === 'approved', 'BOM_MATERIAL_REVISION_NOT_APPROVED', 'BOM line requires an approved material revision', {
    materialRevisionId: materialRevision?.id,
    status: materialRevision?.status,
  });
  invariant(materialRevision.brandId === bom.brandId, 'BOM_MATERIAL_BRAND_MISMATCH', 'BOM and material revision must belong to the same brand');
  invariant(materialRevision.specification.currency === bom.currency, 'BOM_MATERIAL_CURRENCY_MISMATCH', 'Material revision currency must match BOM currency');
  const normalizedKey = String(componentKey ?? '').trim().toUpperCase();
  invariant(COMPONENT_KEY_PATTERN.test(normalizedKey), 'BOM_COMPONENT_KEY_INVALID', 'BOM component key is invalid');
  const normalizedRole = String(componentRole ?? '').trim();
  invariant(normalizedRole.length >= 2 && normalizedRole.length <= 120, 'BOM_COMPONENT_ROLE_INVALID', 'BOM component role is required');
  invariant(Number.isSafeInteger(consumptionMicrounits) && consumptionMicrounits > 0, 'BOM_CONSUMPTION_INVALID', 'BOM consumption must be a positive integer in millionths of the material UOM');
  invariant(Number.isInteger(wasteBasisPoints) && wasteBasisPoints >= 0 && wasteBasisPoints <= 10_000, 'BOM_WASTE_INVALID', 'BOM waste must be between 0 and 10000 basis points');

  const effectiveConsumptionMicrounits = divideCeil(
    BigInt(consumptionMicrounits) * (BASIS_POINTS + BigInt(wasteBasisPoints)),
    BASIS_POINTS,
  );
  const lineCostMinor = divideCeil(
    BigInt(materialRevision.specification.unitCostMinor) * effectiveConsumptionMicrounits,
    MICROS_PER_UNIT,
  );
  invariant(effectiveConsumptionMicrounits <= MAX_SAFE && lineCostMinor <= MAX_SAFE, 'BOM_LINE_VALUE_TOO_LARGE', 'BOM line calculation exceeds safe integer range');
  const line = freezeLine({
    componentKey: normalizedKey,
    componentRole: normalizedRole,
    material: snapshotMaterialRevision(materialRevision),
    consumptionMicrounits,
    wasteBasisPoints,
    effectiveConsumptionMicrounits: Number(effectiveConsumptionMicrounits),
    lineCostMinor: Number(lineCostMinor),
  });
  const lines = bom.lines.filter((candidate) => candidate.componentKey !== normalizedKey);
  lines.push(line);
  lines.sort((left, right) => left.componentKey.localeCompare(right.componentKey));
  return freezeBom({ ...bom, lines, materialCostMinor: sumMaterialCost(lines), version: bom.version + 1, updatedAt });
}

export function removeBomLine(bom, componentKey, updatedAt) {
  assertDraftBom(bom);
  const normalizedKey = String(componentKey ?? '').trim().toUpperCase();
  const lines = bom.lines.filter((candidate) => candidate.componentKey !== normalizedKey);
  invariant(lines.length !== bom.lines.length, 'BOM_LINE_NOT_FOUND', 'BOM line not found', { componentKey: normalizedKey });
  return freezeBom({ ...bom, lines, materialCostMinor: sumMaterialCost(lines), version: bom.version + 1, updatedAt });
}

export function submitBom(bom, submittedAt) {
  assertDraftBom(bom);
  invariant(bom.lines.length > 0, 'BOM_LINES_REQUIRED', 'BOM requires at least one material line before submission');
  return freezeBom({ ...bom, status: 'submitted', version: bom.version + 1, submittedAt, updatedAt: submittedAt });
}

export function approveBom(bom, approvedAt) {
  invariant(bom?.status === 'submitted', 'BOM_NOT_SUBMITTED', 'Only a submitted BOM can be approved', { bomId: bom?.id, status: bom?.status });
  return freezeBom({ ...bom, status: 'approved', version: bom.version + 1, approvedAt, updatedAt: approvedAt });
}

export function supersedeBom(bom, supersededAt) {
  invariant(bom?.status === 'approved', 'BOM_NOT_APPROVED', 'Only an approved BOM can be superseded', { bomId: bom?.id, status: bom?.status });
  return freezeBom({ ...bom, status: 'superseded', version: bom.version + 1, supersededAt, updatedAt: supersededAt });
}

function assertDraftBom(bom) {
  invariant(bom?.status === 'draft', 'BOM_NOT_DRAFT', 'Only a draft BOM can be edited', { bomId: bom?.id, status: bom?.status });
}

function snapshotMaterialRevision(revision) {
  return Object.freeze({
    materialId: revision.materialId,
    revisionId: revision.id,
    materialCode: revision.materialCode,
    materialName: revision.materialName,
    materialType: revision.materialType,
    revisionNumber: revision.revisionNumber,
    uom: revision.specification.uom,
    composition: revision.specification.composition,
    colorCode: revision.specification.colorCode,
    supplierName: revision.specification.supplierName,
    unitCostMinor: revision.specification.unitCostMinor,
    currency: revision.specification.currency,
  });
}

function divideCeil(value, divisor) {
  return (value + divisor - 1n) / divisor;
}

function sumMaterialCost(lines) {
  const total = lines.reduce((sum, line) => sum + BigInt(line.lineCostMinor), 0n);
  invariant(total <= MAX_SAFE, 'BOM_TOTAL_TOO_LARGE', 'BOM material cost exceeds safe integer range');
  return Number(total);
}

function cloneLine(line) {
  return freezeLine({ ...line, material: Object.freeze({ ...line.material }) });
}

function freezeLine(line) {
  return Object.freeze({ ...line, material: Object.freeze({ ...line.material }) });
}

function freezeBom(value) {
  return Object.freeze({ ...value, lines: Object.freeze(value.lines.map(cloneLine)) });
}
