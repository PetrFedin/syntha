import { invariant } from '../../core/errors.mjs';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{1,39}$/;
const SIZE_PATTERN = /^[A-Z0-9][A-Z0-9 ._\/-]{0,15}$/;
const GENDERS = new Set(['women', 'men', 'unisex', 'kids', 'other']);

export function createSizeGrid({ id, brandId, code, name, sizes, baseSize, createdAt }) {
  invariant(id, 'SIZE_GRID_ID_REQUIRED', 'Size grid id is required');
  invariant(brandId, 'SIZE_GRID_BRAND_REQUIRED', 'Size grid brand is required');
  const normalizedCode = normalizeCode(code, 'SIZE_GRID_CODE_INVALID');
  const normalizedName = normalizeText(name, 'SIZE_GRID_NAME_REQUIRED', 'Size grid name is required');
  const normalizedSizes = normalizeSizes(sizes);
  const normalizedBaseSize = normalizeSize(baseSize);
  invariant(normalizedSizes.includes(normalizedBaseSize), 'SIZE_GRID_BASE_SIZE_INVALID', 'Base size must be present in the size grid', {
    baseSize: normalizedBaseSize,
    sizes: normalizedSizes,
  });
  return freezeSizeGrid({
    id,
    brandId,
    code: normalizedCode,
    name: normalizedName,
    sizes: normalizedSizes,
    baseSize: normalizedBaseSize,
    status: 'draft',
    version: 1,
    publishedAt: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function publishSizeGrid(sizeGrid, publishedAt) {
  invariant(sizeGrid?.status === 'draft', 'SIZE_GRID_NOT_DRAFT', 'Only a draft size grid can be published', {
    sizeGridId: sizeGrid?.id,
    status: sizeGrid?.status,
  });
  return freezeSizeGrid({
    ...sizeGrid,
    status: 'published',
    version: sizeGrid.version + 1,
    publishedAt,
    updatedAt: publishedAt,
  });
}

export function createStyle({
  id,
  brandId,
  collection,
  styleCode,
  name,
  category,
  gender,
  sizeGrid,
  createdAt,
}) {
  invariant(id, 'STYLE_ID_REQUIRED', 'Style id is required');
  invariant(brandId, 'STYLE_BRAND_REQUIRED', 'Style brand is required');
  invariant(collection?.id, 'STYLE_COLLECTION_REQUIRED', 'Style collection is required');
  invariant(collection.brandId === brandId, 'STYLE_COLLECTION_BRAND_MISMATCH', 'Style brand must match collection brand');
  invariant(sizeGrid?.id, 'STYLE_SIZE_GRID_REQUIRED', 'Style requires a size grid');
  invariant(sizeGrid.brandId === brandId, 'STYLE_SIZE_GRID_BRAND_MISMATCH', 'Style and size grid must belong to the same brand');
  invariant(sizeGrid.status === 'published', 'STYLE_SIZE_GRID_NOT_PUBLISHED', 'Style requires a published size grid', {
    sizeGridId: sizeGrid.id,
    status: sizeGrid.status,
  });
  const normalizedGender = String(gender ?? '').trim().toLowerCase();
  invariant(GENDERS.has(normalizedGender), 'STYLE_GENDER_INVALID', 'Style gender is invalid', { gender });
  return freezeStyle({
    id,
    brandId,
    collectionId: collection.id,
    styleCode: normalizeCode(styleCode, 'STYLE_CODE_INVALID'),
    name: normalizeText(name, 'STYLE_NAME_REQUIRED', 'Style name is required'),
    category: normalizeText(category, 'STYLE_CATEGORY_REQUIRED', 'Style category is required'),
    gender: normalizedGender,
    sizeGrid: snapshotSizeGrid(sizeGrid),
    status: 'draft',
    version: 1,
    approvedAt: null,
    createdAt,
    updatedAt: createdAt,
  });
}

export function approveStyle(style, approvedAt) {
  invariant(style?.status === 'draft', 'STYLE_NOT_DRAFT', 'Only a draft style can be approved', {
    styleId: style?.id,
    status: style?.status,
  });
  invariant(style.sizeGrid?.status === 'published', 'STYLE_SIZE_GRID_NOT_PUBLISHED', 'Approved style requires a published size grid');
  return freezeStyle({
    ...style,
    status: 'approved',
    version: style.version + 1,
    approvedAt,
    updatedAt: approvedAt,
  });
}

function normalizeCode(value, code) {
  const normalized = String(value ?? '').trim().toUpperCase();
  invariant(CODE_PATTERN.test(normalized), code, 'Code must contain 2-40 uppercase letters, numbers, dots, underscores or dashes');
  return normalized;
}

function normalizeText(value, code, message) {
  const normalized = String(value ?? '').trim();
  invariant(normalized.length >= 2 && normalized.length <= 120, code, message);
  return normalized;
}

function normalizeSizes(values) {
  invariant(Array.isArray(values), 'SIZE_GRID_SIZES_REQUIRED', 'Size grid sizes are required');
  invariant(values.length >= 2 && values.length <= 40, 'SIZE_GRID_SIZE_COUNT_INVALID', 'Size grid must contain between 2 and 40 sizes');
  const normalized = values.map(normalizeSize);
  invariant(new Set(normalized).size === normalized.length, 'SIZE_GRID_SIZE_DUPLICATE', 'Size grid sizes must be unique', { sizes: normalized });
  return Object.freeze(normalized);
}

function normalizeSize(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  invariant(SIZE_PATTERN.test(normalized), 'SIZE_GRID_SIZE_INVALID', 'Size label is invalid', { size: value });
  return normalized;
}

function snapshotSizeGrid(sizeGrid) {
  return Object.freeze({
    id: sizeGrid.id,
    code: sizeGrid.code,
    name: sizeGrid.name,
    status: sizeGrid.status,
    version: sizeGrid.version,
    sizes: Object.freeze([...sizeGrid.sizes]),
    baseSize: sizeGrid.baseSize,
  });
}

function freezeSizeGrid(value) {
  return Object.freeze({ ...value, sizes: Object.freeze([...value.sizes]) });
}

function freezeStyle(value) {
  return Object.freeze({ ...value, sizeGrid: snapshotSizeGrid(value.sizeGrid) });
}
