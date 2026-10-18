import { domainEvent } from '../core/events.mjs';
import { invariant } from '../core/errors.mjs';
import { CAPABILITIES, assertCapability } from '../modules/access-control/public.mjs';
import { approveFitSample, approveMeasurementChart, createFitSample, createMeasurementChart, createTechPack, evaluateFitSample, recordFitSampleMeasurement, rejectFitSample, removeMeasurementPoint, submitMeasurementChart, supersedeMeasurementChart, techPackSourceFingerprint, upsertMeasurementPoint } from '../modules/measurements/public.mjs';

export function createMeasurementService({ store, clock = () => new Date().toISOString(), nextId = defaultIdGenerator() } = {}) {
  invariant(store && typeof store.transaction === 'function', 'MEASUREMENT_STORE_REQUIRED', 'Measurement store is required');
  function execute(commandId, fingerprint, actorId, action) {
    invariant(commandId, 'COMMAND_ID_REQUIRED', 'Every mutation requires commandId');
    return store.transaction(async (tx) => {
      const previous = await tx.getCommand(commandId);
      if (previous) { invariant(previous.fingerprint === fingerprint, 'COMMAND_ID_CONFLICT', 'commandId was already used by another mutation', { commandId }); return previous.result; }
      const result = await action(tx);
      await tx.insertCommand(Object.freeze({ id: commandId, fingerprint, actorId, result, completedAt: clock() }));
      return result;
    });
  }
  async function append(tx, type, aggregateId, payload, commandId, actorId) { await tx.appendOutbox(domainEvent({ id: nextId('event'), type, aggregateId, occurredAt: clock(), payload, metadata: { commandId, actorId } })); }
  async function assertBrandActor(tx, brandId, actorId, capability = CAPABILITIES.TECHNICAL_DEVELOPMENT_MANAGE) {
    const brand = requireEntity(await tx.getOrganisation(brandId), 'BRAND_NOT_FOUND', { brandId });
    invariant(brand.type === 'brand', 'BRAND_REQUIRED', 'Technical development owner must be a brand', { brandId });
    const membership = await tx.getMembership(brandId, actorId);
    assertCapability(membership, capability);
    return brand;
  }
  return Object.freeze({
    createMeasurementChart(commandId, actorId, styleId) {
      return execute(commandId, `createMeasurementChart:${actorId}:${styleId}`, actorId, async (tx) => {
        const style = requireEntity(await tx.getStyle(styleId), 'STYLE_NOT_FOUND', { styleId });
        await assertBrandActor(tx, style.brandId, actorId);
        await tx.lockMeasurementStyle?.(styleId);
        invariant(style.status === 'approved', 'MEASUREMENT_CHART_STYLE_NOT_APPROVED', 'Measurement chart requires an approved style', { styleId, status: style.status });
        invariant(!await tx.getActiveMeasurementChartByStyle(styleId), 'ACTIVE_MEASUREMENT_CHART_REVISION_EXISTS', 'Style already has an active measurement chart revision', { styleId });
        const charts = await tx.listMeasurementChartsByStyle(styleId);
        const chart = createMeasurementChart({ id: nextId('measurement-chart'), style, revisionNumber: (charts.at(-1)?.revisionNumber ?? 0) + 1, createdAt: clock() });
        await tx.insertMeasurementChart(chart);
        await append(tx, 'measurement-chart.created', chart.id, { brandId: chart.brandId, styleId, revisionNumber: chart.revisionNumber }, commandId, actorId);
        return chart;
      });
    },
    reviseMeasurementChart(commandId, actorId, chartId) {
      return execute(commandId, `reviseMeasurementChart:${actorId}:${chartId}`, actorId, async (tx) => {
        const source = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, source.brandId, actorId);
        await tx.lockMeasurementStyle?.(source.styleId);
        invariant(source.status === 'approved', 'APPROVED_MEASUREMENT_CHART_REQUIRED', 'Only an approved measurement chart can be revised', { chartId, status: source.status });
        invariant(!await tx.getActiveMeasurementChartByStyle(source.styleId), 'ACTIVE_MEASUREMENT_CHART_REVISION_EXISTS', 'Style already has an active measurement chart revision', { styleId: source.styleId });
        const style = requireEntity(await tx.getStyle(source.styleId), 'STYLE_NOT_FOUND', { styleId: source.styleId });
        const revision = createMeasurementChart({ id: nextId('measurement-chart'), style, revisionNumber: source.revisionNumber + 1, sourceChart: source, createdAt: clock() });
        await tx.insertMeasurementChart(revision);
        await append(tx, 'measurement-chart.revision-created', revision.id, { brandId: revision.brandId, styleId: revision.styleId, sourceChartId: source.id, revisionNumber: revision.revisionNumber }, commandId, actorId);
        return revision;
      });
    },
    upsertMeasurementPoint(commandId, actorId, chartId, input) {
      const normalized = { ...input, code: String(input.code ?? '').trim().toUpperCase() };
      return execute(commandId, `upsertMeasurementPoint:${actorId}:${chartId}:${JSON.stringify(normalized)}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, current.brandId, actorId);
        const updated = upsertMeasurementPoint(current, normalized, clock());
        await tx.saveMeasurementChart(updated, current.version);
        await append(tx, 'measurement-chart.point-upserted', updated.id, { brandId: updated.brandId, styleId: updated.styleId, pointCode: normalized.code, revisionNumber: updated.revisionNumber }, commandId, actorId);
        return updated;
      });
    },
    removeMeasurementPoint(commandId, actorId, chartId, pointCode) {
      const normalized = String(pointCode ?? '').trim().toUpperCase();
      return execute(commandId, `removeMeasurementPoint:${actorId}:${chartId}:${normalized}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, current.brandId, actorId);
        const updated = removeMeasurementPoint(current, normalized, clock());
        await tx.saveMeasurementChart(updated, current.version);
        await append(tx, 'measurement-chart.point-removed', updated.id, { brandId: updated.brandId, styleId: updated.styleId, pointCode: normalized, revisionNumber: updated.revisionNumber }, commandId, actorId);
        return updated;
      });
    },
    submitMeasurementChart(commandId, actorId, chartId) {
      return execute(commandId, `submitMeasurementChart:${actorId}:${chartId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, current.brandId, actorId);
        const submitted = submitMeasurementChart(current, clock());
        await tx.saveMeasurementChart(submitted, current.version);
        await append(tx, 'measurement-chart.submitted', submitted.id, { brandId: submitted.brandId, styleId: submitted.styleId, revisionNumber: submitted.revisionNumber, pointCount: submitted.points.length }, commandId, actorId);
        return submitted;
      });
    },
    approveMeasurementChart(commandId, actorId, chartId) {
      return execute(commandId, `approveMeasurementChart:${actorId}:${chartId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, current.brandId, actorId);
        await tx.lockMeasurementStyle?.(current.styleId);
        const approvedAt = clock();
        const previous = await tx.getApprovedMeasurementChartByStyle(current.styleId);
        if (previous && previous.id !== current.id) { const superseded = supersedeMeasurementChart(previous, approvedAt); await tx.saveMeasurementChart(superseded, previous.version); }
        const approved = approveMeasurementChart(current, approvedAt);
        await tx.saveMeasurementChart(approved, current.version);
        await append(tx, 'measurement-chart.approved', approved.id, { brandId: approved.brandId, styleId: approved.styleId, revisionNumber: approved.revisionNumber, previousChartId: previous?.id ?? null }, commandId, actorId);
        return approved;
      });
    },
    createFitSample(commandId, actorId, chartId, input) {
      return execute(commandId, `createFitSample:${actorId}:${chartId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        const chart = requireEntity(await tx.getMeasurementChart(chartId), 'MEASUREMENT_CHART_NOT_FOUND', { chartId });
        await assertBrandActor(tx, chart.brandId, actorId);
        invariant(chart.status === 'approved', 'APPROVED_MEASUREMENT_CHART_REQUIRED', 'Fit sample requires an approved measurement chart', { chartId, status: chart.status });
        invariant(!await tx.getFitSampleBySequence(chartId, String(input.sampleType ?? '').trim().toLowerCase(), input.sampleNumber), 'FIT_SAMPLE_SEQUENCE_EXISTS', 'Fit sample number already exists for this chart and sample type', { chartId, sampleType: input.sampleType, sampleNumber: input.sampleNumber });
        const sample = createFitSample({ id: nextId('fit-sample'), chart, ...input, createdAt: clock() });
        await tx.insertFitSample(sample);
        await append(tx, 'fit-sample.created', sample.id, { brandId: sample.brandId, styleId: sample.styleId, chartId: sample.chartId, chartRevisionNumber: sample.chartRevisionNumber, sampleType: sample.sampleType, sampleNumber: sample.sampleNumber, size: sample.size }, commandId, actorId);
        return sample;
      });
    },
    recordFitMeasurement(commandId, actorId, sampleId, pointCode, actualMm) {
      const normalized = String(pointCode ?? '').trim().toUpperCase();
      return execute(commandId, `recordFitMeasurement:${actorId}:${sampleId}:${normalized}:${actualMm}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getFitSample(sampleId), 'FIT_SAMPLE_NOT_FOUND', { sampleId });
        await assertBrandActor(tx, current.brandId, actorId);
        const updated = recordFitSampleMeasurement(current, normalized, actualMm, clock());
        await tx.saveFitSample(updated, current.version);
        await append(tx, 'fit-sample.measurement-recorded', updated.id, { brandId: updated.brandId, styleId: updated.styleId, chartId: updated.chartId, pointCode: normalized, measuredCount: updated.result.measuredCount, totalCount: updated.result.totalCount }, commandId, actorId);
        return updated;
      });
    },
    evaluateFitSample(commandId, actorId, sampleId) {
      return execute(commandId, `evaluateFitSample:${actorId}:${sampleId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getFitSample(sampleId), 'FIT_SAMPLE_NOT_FOUND', { sampleId });
        await assertBrandActor(tx, current.brandId, actorId);
        const evaluated = evaluateFitSample(current, clock());
        await tx.saveFitSample(evaluated, current.version);
        await append(tx, 'fit-sample.evaluated', evaluated.id, { brandId: evaluated.brandId, styleId: evaluated.styleId, chartId: evaluated.chartId, verdict: evaluated.result.verdict, passCount: evaluated.result.passCount, failCount: evaluated.result.failCount }, commandId, actorId);
        return evaluated;
      });
    },
    approveFitSample(commandId, actorId, sampleId) {
      return execute(commandId, `approveFitSample:${actorId}:${sampleId}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getFitSample(sampleId), 'FIT_SAMPLE_NOT_FOUND', { sampleId });
        await assertBrandActor(tx, current.brandId, actorId);
        const approved = approveFitSample(current, clock());
        await tx.saveFitSample(approved, current.version);
        await append(tx, 'fit-sample.approved', approved.id, { brandId: approved.brandId, styleId: approved.styleId, chartId: approved.chartId, sampleType: approved.sampleType, sampleNumber: approved.sampleNumber, size: approved.size }, commandId, actorId);
        return approved;
      });
    },
    rejectFitSample(commandId, actorId, sampleId, reason) {
      return execute(commandId, `rejectFitSample:${actorId}:${sampleId}:${String(reason ?? '').trim()}`, actorId, async (tx) => {
        const current = requireEntity(await tx.getFitSample(sampleId), 'FIT_SAMPLE_NOT_FOUND', { sampleId });
        await assertBrandActor(tx, current.brandId, actorId);
        const rejected = rejectFitSample(current, reason, clock());
        await tx.saveFitSample(rejected, current.version);
        await append(tx, 'fit-sample.rejected', rejected.id, { brandId: rejected.brandId, styleId: rejected.styleId, chartId: rejected.chartId, sampleType: rejected.sampleType, sampleNumber: rejected.sampleNumber, verdict: rejected.result.verdict }, commandId, actorId);
        return rejected;
      });
    },
    generateTechPack(commandId, actorId, { styleId, fitSampleId }) {
      const input = { styleId, fitSampleId };
      return execute(commandId, `generateTechPack:${actorId}:${JSON.stringify(input)}`, actorId, async (tx) => {
        const style = requireEntity(await tx.getStyle(styleId), 'STYLE_NOT_FOUND', { styleId });
        await assertBrandActor(tx, style.brandId, actorId);
        await tx.lockTechPackStyle?.(styleId);
        const bom = requireEntity(await tx.getApprovedBomByStyle(styleId), 'APPROVED_BOM_REQUIRED', { styleId });
        const chart = requireEntity(await tx.getApprovedMeasurementChartByStyle(styleId), 'APPROVED_MEASUREMENT_CHART_REQUIRED', { styleId });
        const fitSample = requireEntity(await tx.getFitSample(fitSampleId), 'FIT_SAMPLE_NOT_FOUND', { fitSampleId });
        invariant(fitSample.styleId === styleId, 'TECH_PACK_FIT_SAMPLE_STYLE_MISMATCH', 'Fit sample belongs to another style', { styleId, fitSampleId });
        invariant(fitSample.chartId === chart.id, 'TECH_PACK_FIT_SAMPLE_CHART_MISMATCH', 'Fit sample is not approved against the current measurement chart', { fitSampleChartId: fitSample.chartId, currentChartId: chart.id });
        invariant(fitSample.status === 'approved', 'TECH_PACK_FIT_SAMPLE_NOT_APPROVED', 'Tech pack requires an approved fit sample', { fitSampleId, status: fitSample.status });
        const sourceFingerprint = techPackSourceFingerprint({ style, bom, chart, fitSample });
        invariant(!await tx.getTechPackBySourceFingerprint(styleId, sourceFingerprint), 'TECH_PACK_ALREADY_GENERATED_FOR_SOURCES', 'A tech pack already exists for the current approved sources', { styleId });
        const previous = await tx.getLatestTechPackByStyle(styleId);
        const techPack = createTechPack({ id: nextId('tech-pack'), revisionNumber: (previous?.revisionNumber ?? 0) + 1, style, bom, chart, fitSample, generatedBy: actorId, generatedAt: clock() });
        await tx.insertTechPack(techPack);
        await append(tx, 'tech-pack.generated', techPack.id, { brandId: techPack.brandId, styleId: techPack.styleId, revisionNumber: techPack.revisionNumber, sourceFingerprint: techPack.sourceFingerprint }, commandId, actorId);
        return techPack;
      });
    },
    getTechPackManifest(actorId, techPackId) {
      return store.transaction(async (tx) => {
        const techPack = requireEntity(await tx.getTechPack(techPackId), 'TECH_PACK_NOT_FOUND', { techPackId });
        await assertBrandActor(tx, techPack.brandId, actorId, CAPABILITIES.TECHNICAL_DEVELOPMENT_READ);
        return Object.freeze({ id: techPack.id, styleId: techPack.styleId, styleCode: techPack.styleCode, revisionNumber: techPack.revisionNumber, sourceFingerprint: techPack.sourceFingerprint, generatedAt: techPack.generatedAt, manifest: techPack.manifest });
      });
    },
  });
}
function requireEntity(entity, code, details) { invariant(entity, code, 'Entity not found', details); return entity; }
function defaultIdGenerator() { let sequence = 0; return (prefix) => `${prefix}_${++sequence}`; }
