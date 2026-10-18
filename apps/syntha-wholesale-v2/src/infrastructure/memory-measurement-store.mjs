import { invariant } from '../core/errors.mjs';

export function createMemoryMeasurementStore({ sourceStore, productSpecificationStore } = {}) {
  invariant(sourceStore && typeof sourceStore.snapshot === 'function', 'MEASUREMENT_SOURCE_STORE_REQUIRED', 'Measurement source store is required');
  invariant(productSpecificationStore && typeof productSpecificationStore.snapshot === 'function', 'MEASUREMENT_SPECIFICATION_STORE_REQUIRED', 'Product specification store is required');
  let state = emptyState(); let tail = Promise.resolve();
  function transaction(work) {
    const run = tail.then(async () => {
      const [source, specification] = await Promise.all([sourceStore.snapshot(), productSpecificationStore.snapshot()]);
      const draft = cloneState(state); const result = await work(view(draft, source, specification)); state = draft; return result;
    });
    tail = run.catch(() => undefined); return run;
  }
  return Object.freeze({ transaction, snapshot() { return Object.freeze({ measurementCharts: [...state.measurementCharts.values()], fitSamples: [...state.fitSamples.values()], techPacks: [...state.techPacks.values()], commands: [...state.commands.values()], outbox: [...state.outbox.values()], events: [...state.outbox.values()].map((record) => record.event) }); } });
}
function emptyState() { return { measurementCharts: new Map(), fitSamples: new Map(), techPacks: new Map(), commands: new Map(), outbox: new Map() }; }
function cloneState(state) { return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, new Map(value)])); }
function view(state, source, specification) {
  return Object.freeze({
    getOrganisation: async (id) => array(source.organisations).find((item) => item.id === id),
    getMembership: async (organisationId, userId) => array(source.memberships).find((item) => item.organisationId === organisationId && item.userId === userId),
    getStyle: async (id) => array(source.styles).find((item) => item.id === id),
    getApprovedBomByStyle: async (styleId) => array(specification.boms).find((item) => item.styleId === styleId && item.status === 'approved'),
    lockMeasurementStyle: async () => undefined, lockTechPackStyle: async () => undefined,
    getMeasurementChart: async (id) => state.measurementCharts.get(id),
    listMeasurementChartsByStyle: async (styleId) => [...state.measurementCharts.values()].filter((item) => item.styleId === styleId).sort((left, right) => left.revisionNumber - right.revisionNumber),
    getActiveMeasurementChartByStyle: async (styleId) => [...state.measurementCharts.values()].find((item) => item.styleId === styleId && ['draft', 'submitted'].includes(item.status)),
    getApprovedMeasurementChartByStyle: async (styleId) => [...state.measurementCharts.values()].find((item) => item.styleId === styleId && item.status === 'approved'),
    insertMeasurementChart: async (value) => {
      invariant(![...state.measurementCharts.values()].some((item) => item.styleId === value.styleId && item.revisionNumber === value.revisionNumber), 'MEASUREMENT_CHART_REVISION_EXISTS', 'Measurement chart revision already exists', { styleId: value.styleId, revisionNumber: value.revisionNumber });
      invariant(!(['draft', 'submitted'].includes(value.status) && [...state.measurementCharts.values()].some((item) => item.styleId === value.styleId && ['draft', 'submitted'].includes(item.status))), 'ACTIVE_MEASUREMENT_CHART_REVISION_EXISTS', 'Style already has an active measurement chart revision', { styleId: value.styleId });
      insertUnique(state.measurementCharts, value.id, value, 'MEASUREMENT_CHART_ALREADY_EXISTS');
    },
    saveMeasurementChart: async (value, expectedVersion) => saveVersioned(state.measurementCharts, value, expectedVersion, 'MEASUREMENT_CHART_CONCURRENCY_CONFLICT'),
    getFitSample: async (id) => state.fitSamples.get(id),
    getFitSampleBySequence: async (chartId, sampleType, sampleNumber) => [...state.fitSamples.values()].find((item) => item.chartId === chartId && item.sampleType === sampleType && item.sampleNumber === sampleNumber),
    insertFitSample: async (value) => { invariant(![...state.fitSamples.values()].some((item) => item.chartId === value.chartId && item.sampleType === value.sampleType && item.sampleNumber === value.sampleNumber), 'FIT_SAMPLE_SEQUENCE_EXISTS', 'Fit sample number already exists for this chart and type', { chartId: value.chartId, sampleType: value.sampleType, sampleNumber: value.sampleNumber }); insertUnique(state.fitSamples, value.id, value, 'FIT_SAMPLE_ALREADY_EXISTS'); },
    saveFitSample: async (value, expectedVersion) => saveVersioned(state.fitSamples, value, expectedVersion, 'FIT_SAMPLE_CONCURRENCY_CONFLICT'),
    getTechPack: async (id) => state.techPacks.get(id),
    getTechPackBySourceFingerprint: async (styleId, sourceFingerprint) => [...state.techPacks.values()].find((item) => item.styleId === styleId && item.sourceFingerprint === sourceFingerprint),
    getLatestTechPackByStyle: async (styleId) => [...state.techPacks.values()].filter((item) => item.styleId === styleId).sort((left, right) => right.revisionNumber - left.revisionNumber)[0],
    insertTechPack: async (value) => { invariant(![...state.techPacks.values()].some((item) => item.styleId === value.styleId && item.sourceFingerprint === value.sourceFingerprint), 'TECH_PACK_ALREADY_GENERATED_FOR_SOURCES', 'Tech pack already exists for source fingerprint', { styleId: value.styleId }); invariant(![...state.techPacks.values()].some((item) => item.styleId === value.styleId && item.revisionNumber === value.revisionNumber), 'TECH_PACK_REVISION_EXISTS', 'Tech pack revision already exists', { styleId: value.styleId, revisionNumber: value.revisionNumber }); insertUnique(state.techPacks, value.id, value, 'TECH_PACK_ALREADY_EXISTS'); },
    getCommand: async (id) => state.commands.get(id), insertCommand: async (command) => insertUnique(state.commands, command.id, command, 'COMMAND_ALREADY_EXISTS'), appendOutbox: async (event) => insertUnique(state.outbox, event.id, Object.freeze({ event, status: 'pending', publishedAt: null }), 'OUTBOX_EVENT_ALREADY_EXISTS'),
  });
}
function array(value) { return Array.isArray(value) ? value : []; }
function insertUnique(map, key, value, code) { invariant(!map.has(key), code, 'Entity already exists', { key }); map.set(key, value); }
function saveVersioned(map, entity, expectedVersion, code) { const current = map.get(entity.id); invariant(current, 'ENTITY_NOT_FOUND', 'Versioned entity not found', { id: entity.id }); invariant(current.version === expectedVersion, code, 'Optimistic concurrency conflict', { id: entity.id, expectedVersion, actualVersion: current.version }); invariant(entity.version === expectedVersion + 1, 'VERSION_INCREMENT_INVALID', 'Version must increment exactly once', { id: entity.id, expectedVersion, nextVersion: entity.version }); map.set(entity.id, entity); }
