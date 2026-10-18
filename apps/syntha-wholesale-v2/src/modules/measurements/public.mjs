import { invariant } from '../../core/errors.mjs';

const POINT_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]{0,19}$/;
const SAMPLE_TYPES = new Set(['proto', 'fit', 'size-set', 'pps']);
const MAX_MEASUREMENT_MM = 5_000;
const MAX_TOLERANCE_MM = 500;
const MAX_GRADE_STEP_MM = 500;

export function createMeasurementChart({ id, style, revisionNumber, sourceChart = null, createdAt }) {
  invariant(id, 'MEASUREMENT_CHART_ID_REQUIRED', 'Measurement chart id is required');
  invariant(style?.id, 'MEASUREMENT_CHART_STYLE_REQUIRED', 'Measurement chart requires a style');
  invariant(style.status === 'approved', 'MEASUREMENT_CHART_STYLE_NOT_APPROVED', 'Measurement chart requires an approved style', { styleId: style.id, status: style.status });
  invariant(Number.isInteger(revisionNumber) && revisionNumber > 0, 'MEASUREMENT_CHART_REVISION_INVALID', 'Measurement chart revision must be a positive integer');
  if (sourceChart) {
    invariant(sourceChart.status === 'approved', 'APPROVED_MEASUREMENT_CHART_REQUIRED', 'A new measurement chart revision requires an approved source chart');
    invariant(sourceChart.styleId === style.id, 'MEASUREMENT_CHART_STYLE_MISMATCH', 'Source measurement chart belongs to another style');
    invariant(revisionNumber === sourceChart.revisionNumber + 1, 'MEASUREMENT_CHART_REVISION_SEQUENCE_INVALID', 'Measurement chart revision must increment exactly once');
  }
  return freezeChart({
    id, brandId: style.brandId, styleId: style.id, styleCode: style.styleCode, styleName: style.name, styleVersion: style.version,
    sizeGrid: snapshotSizeGrid(style.sizeGrid), revisionNumber, sourceChartId: sourceChart?.id ?? null, status: 'draft',
    points: sourceChart ? sourceChart.points.map(clonePoint) : [], version: 1, submittedAt: null, approvedAt: null,
    supersededAt: null, createdAt, updatedAt: createdAt,
  });
}

export function upsertMeasurementPoint(chart, input, updatedAt) {
  assertChartDraft(chart);
  const point = normalizePoint(chart.sizeGrid, input);
  const points = chart.points.filter((item) => item.code !== point.code);
  points.push(point);
  points.sort((left, right) => left.code.localeCompare(right.code));
  return freezeChart({ ...chart, points, version: chart.version + 1, updatedAt });
}
export function removeMeasurementPoint(chart, pointCode, updatedAt) {
  assertChartDraft(chart);
  const code = normalizePointCode(pointCode);
  invariant(chart.points.some((item) => item.code === code), 'MEASUREMENT_POINT_NOT_FOUND', 'Measurement point not found', { pointCode: code });
  return freezeChart({ ...chart, points: chart.points.filter((item) => item.code !== code), version: chart.version + 1, updatedAt });
}
export function submitMeasurementChart(chart, submittedAt) {
  assertChartDraft(chart);
  invariant(chart.points.length > 0, 'MEASUREMENT_CHART_EMPTY', 'Measurement chart must contain at least one point before submission');
  return freezeChart({ ...chart, status: 'submitted', version: chart.version + 1, submittedAt, updatedAt: submittedAt });
}
export function approveMeasurementChart(chart, approvedAt) {
  invariant(chart?.status === 'submitted', 'MEASUREMENT_CHART_NOT_SUBMITTED', 'Only a submitted measurement chart can be approved', { chartId: chart?.id, status: chart?.status });
  return freezeChart({ ...chart, status: 'approved', version: chart.version + 1, approvedAt, updatedAt: approvedAt });
}
export function supersedeMeasurementChart(chart, supersededAt) {
  invariant(chart?.status === 'approved', 'MEASUREMENT_CHART_NOT_APPROVED', 'Only an approved measurement chart can be superseded', { chartId: chart?.id, status: chart?.status });
  return freezeChart({ ...chart, status: 'superseded', version: chart.version + 1, supersededAt, updatedAt: supersededAt });
}

export function createFitSample({ id, chart, sampleType, sampleNumber, size, notes = '', createdAt }) {
  invariant(id, 'FIT_SAMPLE_ID_REQUIRED', 'Fit sample id is required');
  invariant(chart?.status === 'approved', 'APPROVED_MEASUREMENT_CHART_REQUIRED', 'Fit sample requires an approved measurement chart');
  invariant(chart.points.length > 0, 'MEASUREMENT_CHART_EMPTY', 'Fit sample requires a non-empty measurement chart');
  const normalizedType = String(sampleType ?? '').trim().toLowerCase();
  invariant(SAMPLE_TYPES.has(normalizedType), 'FIT_SAMPLE_TYPE_INVALID', 'Fit sample type is invalid', { sampleType });
  invariant(Number.isInteger(sampleNumber) && sampleNumber > 0 && sampleNumber <= 9_999, 'FIT_SAMPLE_NUMBER_INVALID', 'Fit sample number must be between 1 and 9999');
  const normalizedSize = String(size ?? '').trim().toUpperCase();
  invariant(chart.sizeGrid.sizes.includes(normalizedSize), 'FIT_SAMPLE_SIZE_INVALID', 'Fit sample size must exist in the measurement chart size grid', { size: normalizedSize, sizes: chart.sizeGrid.sizes });
  const measurements = chart.points.map((point) => freezeMeasurement({ pointCode: point.code, description: point.description, targetMm: point.targetsMm[normalizedSize], toleranceMinusMm: point.toleranceMinusMm, tolerancePlusMm: point.tolerancePlusMm, actualMm: null, deviationMm: null, withinTolerance: null }));
  return freezeSample({ id, brandId: chart.brandId, styleId: chart.styleId, styleCode: chart.styleCode, chartId: chart.id, chartRevisionNumber: chart.revisionNumber, chartVersion: chart.version, sampleType: normalizedType, sampleNumber, size: normalizedSize, notes: normalizeOptionalText(notes, 1_000, 'FIT_SAMPLE_NOTES_TOO_LONG'), status: 'draft', measurements, result: freezeResult({ verdict: 'pending', passCount: 0, failCount: 0, measuredCount: 0, totalCount: measurements.length }), version: 1, evaluatedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null, createdAt, updatedAt: createdAt });
}
export function recordFitSampleMeasurement(sample, pointCode, actualMm, updatedAt) {
  invariant(sample?.status === 'draft', 'FIT_SAMPLE_NOT_DRAFT', 'Measurements can only be recorded while a fit sample is draft', { sampleId: sample?.id, status: sample?.status });
  const code = normalizePointCode(pointCode);
  const index = sample.measurements.findIndex((item) => item.pointCode === code);
  invariant(index >= 0, 'FIT_SAMPLE_POINT_NOT_FOUND', 'Measurement point is not part of the fit sample', { pointCode: code });
  const normalizedActual = integerInRange(actualMm, 0, MAX_MEASUREMENT_MM, 'FIT_SAMPLE_ACTUAL_INVALID', 'Actual measurement must be an integer number of millimetres');
  const current = sample.measurements[index];
  const deviationMm = normalizedActual - current.targetMm;
  const withinTolerance = deviationMm >= -current.toleranceMinusMm && deviationMm <= current.tolerancePlusMm;
  const measurements = sample.measurements.map((item, itemIndex) => itemIndex === index ? freezeMeasurement({ ...current, actualMm: normalizedActual, deviationMm, withinTolerance }) : item);
  return freezeSample({ ...sample, measurements, result: pendingResult(measurements), version: sample.version + 1, updatedAt });
}
export function evaluateFitSample(sample, evaluatedAt) {
  invariant(sample?.status === 'draft', 'FIT_SAMPLE_NOT_DRAFT', 'Only a draft fit sample can be evaluated', { sampleId: sample?.id, status: sample?.status });
  invariant(sample.measurements.length > 0, 'FIT_SAMPLE_EMPTY', 'Fit sample contains no measurement points');
  invariant(sample.measurements.every((item) => Number.isInteger(item.actualMm)), 'FIT_SAMPLE_INCOMPLETE', 'Every measurement point must have an actual value before evaluation');
  const result = evaluatedResult(sample.measurements);
  return freezeSample({ ...sample, status: 'evaluated', result, version: sample.version + 1, evaluatedAt, updatedAt: evaluatedAt });
}
export function approveFitSample(sample, approvedAt) {
  invariant(sample?.status === 'evaluated', 'FIT_SAMPLE_NOT_EVALUATED', 'Only an evaluated fit sample can be approved', { sampleId: sample?.id, status: sample?.status });
  invariant(sample.result.verdict === 'pass', 'FIT_SAMPLE_OUT_OF_TOLERANCE', 'Fit sample cannot be approved while measurements are outside tolerance', { sampleId: sample.id, failCount: sample.result.failCount });
  return freezeSample({ ...sample, status: 'approved', version: sample.version + 1, approvedAt, updatedAt: approvedAt });
}
export function rejectFitSample(sample, reason, rejectedAt) {
  invariant(sample?.status === 'evaluated', 'FIT_SAMPLE_NOT_EVALUATED', 'Only an evaluated fit sample can be rejected', { sampleId: sample?.id, status: sample?.status });
  const rejectionReason = normalizeRequiredText(reason, 2, 1_000, 'FIT_SAMPLE_REJECTION_REASON_REQUIRED', 'Fit sample rejection reason is required');
  return freezeSample({ ...sample, status: 'rejected', rejectionReason, version: sample.version + 1, rejectedAt, updatedAt: rejectedAt });
}

export function techPackSourceFingerprint({ style, bom, chart, fitSample }) {
  invariant(style?.id && bom?.id && chart?.id && fitSample?.id, 'TECH_PACK_SOURCES_REQUIRED', 'Tech pack source entities are required');
  return [`style:${style.id}@${style.version}`, `bom:${bom.id}@${bom.version}`, `chart:${chart.id}@${chart.version}`, `sample:${fitSample.id}@${fitSample.version}`].join('|');
}
export function createTechPack({ id, revisionNumber, style, bom, chart, fitSample, generatedBy, generatedAt }) {
  invariant(id, 'TECH_PACK_ID_REQUIRED', 'Tech pack id is required');
  invariant(Number.isInteger(revisionNumber) && revisionNumber > 0, 'TECH_PACK_REVISION_INVALID', 'Tech pack revision must be a positive integer');
  invariant(style?.status === 'approved', 'TECH_PACK_STYLE_NOT_APPROVED', 'Tech pack requires an approved style');
  invariant(bom?.status === 'approved', 'TECH_PACK_BOM_NOT_APPROVED', 'Tech pack requires an approved BOM');
  invariant(chart?.status === 'approved', 'TECH_PACK_CHART_NOT_APPROVED', 'Tech pack requires an approved measurement chart');
  invariant(fitSample?.status === 'approved', 'TECH_PACK_FIT_SAMPLE_NOT_APPROVED', 'Tech pack requires an approved fit sample');
  invariant(style.id === bom.styleId && style.id === chart.styleId && style.id === fitSample.styleId, 'TECH_PACK_STYLE_MISMATCH', 'Tech pack sources must belong to the same style');
  invariant(chart.id === fitSample.chartId, 'TECH_PACK_FIT_SAMPLE_CHART_MISMATCH', 'Approved fit sample must reference the selected measurement chart');
  const sourceFingerprint = techPackSourceFingerprint({ style, bom, chart, fitSample });
  return freezeTechPack({ id, brandId: style.brandId, styleId: style.id, styleCode: style.styleCode, revisionNumber, status: 'generated', sourceFingerprint, sources: Object.freeze({ styleId: style.id, styleVersion: style.version, bomId: bom.id, bomRevisionNumber: bom.revisionNumber, bomVersion: bom.version, measurementChartId: chart.id, measurementChartRevisionNumber: chart.revisionNumber, measurementChartVersion: chart.version, fitSampleId: fitSample.id, fitSampleVersion: fitSample.version }), manifest: createManifest(style, bom, chart, fitSample), generatedBy, generatedAt, version: 1 });
}

function normalizePoint(sizeGrid, input) {
  const code = normalizePointCode(input.code);
  const description = normalizeRequiredText(input.description, 2, 160, 'MEASUREMENT_POINT_DESCRIPTION_REQUIRED', 'Measurement point description is required');
  const toleranceMinusMm = integerInRange(input.toleranceMinusMm, 0, MAX_TOLERANCE_MM, 'MEASUREMENT_POINT_TOLERANCE_INVALID', 'Measurement tolerance must be a non-negative integer number of millimetres');
  const tolerancePlusMm = integerInRange(input.tolerancePlusMm, 0, MAX_TOLERANCE_MM, 'MEASUREMENT_POINT_TOLERANCE_INVALID', 'Measurement tolerance must be a non-negative integer number of millimetres');
  const baseTargetMm = integerInRange(input.baseTargetMm, 0, MAX_MEASUREMENT_MM, 'MEASUREMENT_POINT_BASE_TARGET_INVALID', 'Base target must be an integer number of millimetres');
  const gradeStepMm = integerInRange(input.gradeStepMm ?? 0, -MAX_GRADE_STEP_MM, MAX_GRADE_STEP_MM, 'MEASUREMENT_POINT_GRADE_STEP_INVALID', 'Grade step must be an integer number of millimetres');
  const manualTargetsMm = normalizeManualTargets(sizeGrid.sizes, input.manualTargetsMm ?? {});
  const baseIndex = sizeGrid.sizes.indexOf(sizeGrid.baseSize);
  invariant(baseIndex >= 0, 'MEASUREMENT_SIZE_GRID_BASE_INVALID', 'Measurement chart size grid base size is invalid');
  const targetsMm = {};
  sizeGrid.sizes.forEach((size, index) => {
    const automatic = baseTargetMm + ((index - baseIndex) * gradeStepMm);
    const target = Object.hasOwn(manualTargetsMm, size) ? manualTargetsMm[size] : automatic;
    targetsMm[size] = integerInRange(target, 0, MAX_MEASUREMENT_MM, 'MEASUREMENT_POINT_TARGET_INVALID', 'Measurement target must be an integer number of millimetres');
  });
  return freezePoint({ code, description, toleranceMinusMm, tolerancePlusMm, baseTargetMm, gradeStepMm, manualTargetsMm, targetsMm });
}
function normalizeManualTargets(sizes, input) {
  invariant(input && typeof input === 'object' && !Array.isArray(input), 'MEASUREMENT_POINT_MANUAL_TARGETS_INVALID', 'Manual measurement targets must be an object keyed by size');
  const normalized = {};
  for (const [rawSize, rawValue] of Object.entries(input)) {
    const size = String(rawSize).trim().toUpperCase();
    invariant(sizes.includes(size), 'MEASUREMENT_POINT_MANUAL_SIZE_INVALID', 'Manual measurement target references a size outside the chart', { size });
    normalized[size] = integerInRange(rawValue, 0, MAX_MEASUREMENT_MM, 'MEASUREMENT_POINT_TARGET_INVALID', 'Measurement target must be an integer number of millimetres');
  }
  return Object.freeze(normalized);
}
function pendingResult(measurements) {
  const measured = measurements.filter((item) => Number.isInteger(item.actualMm));
  return freezeResult({ verdict: 'pending', passCount: measured.filter((item) => item.withinTolerance === true).length, failCount: measured.filter((item) => item.withinTolerance === false).length, measuredCount: measured.length, totalCount: measurements.length });
}
function evaluatedResult(measurements) {
  const passCount = measurements.filter((item) => item.withinTolerance === true).length;
  const failCount = measurements.length - passCount;
  return freezeResult({ verdict: failCount === 0 ? 'pass' : 'fail', passCount, failCount, measuredCount: measurements.length, totalCount: measurements.length });
}
function createManifest(style, bom, chart, fitSample) {
  return deepFreeze({ schemaVersion: 1, style: { id: style.id, code: style.styleCode, name: style.name, category: style.category, gender: style.gender, version: style.version, sizeGrid: snapshotSizeGrid(style.sizeGrid) }, billOfMaterials: { id: bom.id, revisionNumber: bom.revisionNumber, currency: bom.currency, materialCostMinor: bom.materialCostMinor, lines: bom.lines.map((line) => ({ ...line })) }, measurementChart: { id: chart.id, revisionNumber: chart.revisionNumber, points: chart.points.map((point) => ({ ...point, targetsMm: { ...point.targetsMm }, manualTargetsMm: { ...point.manualTargetsMm } })) }, fitApproval: { id: fitSample.id, sampleType: fitSample.sampleType, sampleNumber: fitSample.sampleNumber, size: fitSample.size, result: { ...fitSample.result }, measurements: fitSample.measurements.map((item) => ({ ...item })), approvedAt: fitSample.approvedAt } });
}
function assertChartDraft(chart) { invariant(chart?.status === 'draft', 'MEASUREMENT_CHART_NOT_DRAFT', 'Measurement chart can only be edited while draft', { chartId: chart?.id, status: chart?.status }); }
function normalizePointCode(value) { const normalized = String(value ?? '').trim().toUpperCase(); invariant(POINT_CODE_PATTERN.test(normalized), 'MEASUREMENT_POINT_CODE_INVALID', 'Measurement point code is invalid', { pointCode: value }); return normalized; }
function integerInRange(value, min, max, code, message) { invariant(Number.isSafeInteger(value) && value >= min && value <= max, code, message, { value, min, max }); return value; }
function normalizeRequiredText(value, min, max, code, message) { const normalized = String(value ?? '').trim(); invariant(normalized.length >= min && normalized.length <= max, code, message, { min, max }); return normalized; }
function normalizeOptionalText(value, max, code) { const normalized = String(value ?? '').trim(); invariant(normalized.length <= max, code, 'Text value is too long', { max }); return normalized; }
function snapshotSizeGrid(sizeGrid) { return Object.freeze({ id: sizeGrid.id, code: sizeGrid.code, name: sizeGrid.name, status: sizeGrid.status, version: sizeGrid.version, sizes: Object.freeze([...sizeGrid.sizes]), baseSize: sizeGrid.baseSize }); }
function clonePoint(point) { return freezePoint({ ...point, manualTargetsMm: { ...point.manualTargetsMm }, targetsMm: { ...point.targetsMm } }); }
function freezePoint(value) { return Object.freeze({ ...value, manualTargetsMm: Object.freeze({ ...value.manualTargetsMm }), targetsMm: Object.freeze({ ...value.targetsMm }) }); }
function freezeChart(value) { return Object.freeze({ ...value, sizeGrid: snapshotSizeGrid(value.sizeGrid), points: Object.freeze(value.points.map(clonePoint)) }); }
function freezeMeasurement(value) { return Object.freeze({ ...value }); }
function freezeResult(value) { return Object.freeze({ ...value }); }
function freezeSample(value) { return Object.freeze({ ...value, measurements: Object.freeze(value.measurements.map(freezeMeasurement)), result: freezeResult(value.result) }); }
function freezeTechPack(value) { return Object.freeze({ ...value, sources: Object.freeze({ ...value.sources }), manifest: deepFreeze(value.manifest) }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); return value; }
