const renderProductDevelopmentBase = renderProductDevelopment;
renderProductDevelopment = function renderProductDevelopmentWithTechnicalFlow() {
  const box = renderProductDevelopmentBase();
  box.append(renderTechnicalDevelopment());
  return box;
};

function renderTechnicalDevelopment() {
  const readableBrandIds = technicalBrandIds();
  if (!readableBrandIds.size) return notice('\u0418\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f, fit review \u0438 Tech Pack \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0442\u043e\u043b\u044c\u043a\u043e \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u043a\u043e\u043c\u0430\u043d\u0434\u0435.');
  const box = el('div');
  const charts = [...(state.workspace.measurementCharts || [])].sort((a,b) => a.styleCode.localeCompare(b.styleCode) || a.revisionNumber - b.revisionNumber);
  const samples = [...(state.workspace.fitSamples || [])].sort((a,b) => a.styleCode.localeCompare(b.styleCode) || a.chartRevisionNumber - b.chartRevisionNumber || a.sampleNumber - b.sampleNumber);
  const packs = [...(state.workspace.techPacks || [])].sort((a,b) => a.styleCode.localeCompare(b.styleCode) || a.revisionNumber - b.revisionNumber);
  const eligibleStyles = (state.workspace.styles || []).filter(style => style.status === 'approved' && readableBrandIds.has(style.brandId) && !charts.some(chart => chart.styleId === style.id));
  box.append(toolbar(
    'Measurement Chart / Fit Review / Tech Pack',
    eligibleStyles.length ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c Measurement Chart' : '\u041d\u043e\u0432\u044b\u0445 Style \u0431\u0435\u0437 chart \u043d\u0435\u0442',
    eligibleStyles.length ? () => measurementChartForm(eligibleStyles) : () => toast('\u0414\u043b\u044f \u043d\u043e\u0432\u043e\u0439 \u0442\u0430\u0431\u043b\u0438\u0446\u044b \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0443\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 Style.', 'error'),
  ));
  box.append(sectionCard('Measurement Charts', charts.length ? charts.map(measurementChartCard) : [empty('Measurement Charts \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')]));
  box.append(sectionCard('Fit Samples', samples.length ? samples.map(fitSampleCard) : [empty('Fit Samples \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')]));
  box.append(sectionCard('Tech Packs', packs.length ? packs.map(techPackCard) : [empty('Tech Packs \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')]));
  return box;
}

function technicalBrandIds() {
  return new Set((state.workspace.memberships || []).filter(item => item.organisationType === 'brand' && ['owner','admin','product'].includes(item.role)).map(item => item.organisationId));
}
function canManageTechnicalBrand(brandId) { return technicalBrandIds().has(brandId); }
function activeMeasurementChart(styleId) { return (state.workspace.measurementCharts || []).find(item => item.styleId === styleId && ['draft','submitted'].includes(item.status)); }
function approvedMeasurementChart(styleId) { return (state.workspace.measurementCharts || []).find(item => item.styleId === styleId && item.status === 'approved'); }
function approvedBom(styleId) { return (state.workspace.boms || []).find(item => item.styleId === styleId && item.status === 'approved'); }

function measurementChartCard(chart) {
  const actions = [];
  if (canManageTechnicalBrand(chart.brandId) && chart.status === 'draft') {
    actions.push(formButton('\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c POM', () => measurementPointForm(chart)));
    if (chart.points.length) actions.push(actionButton('\u041d\u0430 approval', () => mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/submit`, { chartId: chart.id }), 'primary'));
  }
  if (canManageTechnicalBrand(chart.brandId) && chart.status === 'submitted') actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c chart', () => mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/approve`, { chartId: chart.id }), 'primary'));
  if (canManageTechnicalBrand(chart.brandId) && chart.status === 'approved') {
    actions.push(formButton('\u041d\u043e\u0432\u044b\u0439 fit sample', () => fitSampleForm(chart), 'primary'));
    if (!activeMeasurementChart(chart.styleId)) actions.push(actionButton(`\u0421\u043e\u0437\u0434\u0430\u0442\u044c r${chart.revisionNumber + 1}`, () => mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/revisions`, { chartId: chart.id })));
  }
  const card = entity(`${chart.styleCode} / Measurement r${chart.revisionNumber}`, chart.status, [
    `Size grid: ${chart.sizeGrid.code} / ${chart.sizeGrid.sizes.join(' / ')}`,
    `Base: ${chart.sizeGrid.baseSize}`,
    `POM: ${chart.points.length}`,
    `v${chart.version}`,
  ], actions);
  if (chart.points.length) {
    const stack = el('div', { className: 'stack' });
    chart.points.forEach(point => stack.append(measurementPointCard(chart, point)));
    card.append(stack);
  }
  return card;
}

function measurementPointCard(chart, point) {
  const actions = [];
  if (chart.status === 'draft' && canManageTechnicalBrand(chart.brandId)) {
    actions.push(formButton('\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c', () => measurementPointForm(chart, point)));
    actions.push(actionButton('\u0423\u0434\u0430\u043b\u0438\u0442\u044c', () => mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/points/${encodeURIComponent(point.code)}`, { chartId: chart.id, pointCode: point.code }, 'DELETE'), 'danger'));
  }
  return entity(`${point.code} / ${point.description}`, 'POM', [
    chart.sizeGrid.sizes.map(size => `${size}:${point.targetsMm[size]}mm`).join(' / '),
    `Tol -${point.toleranceMinusMm}/+${point.tolerancePlusMm} mm`,
    `Grade ${point.gradeStepMm} mm`,
  ], actions);
}

function fitSampleCard(sample) {
  const actions = [];
  if (canManageTechnicalBrand(sample.brandId) && sample.status === 'draft' && sample.result.totalCount > 0 && sample.result.measuredCount === sample.result.totalCount) actions.push(actionButton('\u041e\u0446\u0435\u043d\u0438\u0442\u044c sample', () => mutate(`/v2/plm/fit-samples/${encodeURIComponent(sample.id)}/evaluate`, { sampleId: sample.id }), 'primary'));
  if (canManageTechnicalBrand(sample.brandId) && sample.status === 'evaluated') {
    if (sample.result.verdict === 'pass') actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c fit', () => mutate(`/v2/plm/fit-samples/${encodeURIComponent(sample.id)}/approve`, { sampleId: sample.id }), 'primary'));
    actions.push(formButton('\u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c', () => rejectFitSampleForm(sample), 'danger'));
  }
  const currentChart = approvedMeasurementChart(sample.styleId);
  const matchingPack = (state.workspace.techPacks || []).some(item => item.styleId === sample.styleId && item.sources?.measurementChartId === sample.chartId && item.sources?.fitSampleId === sample.id);
  if (canManageTechnicalBrand(sample.brandId) && sample.status === 'approved' && currentChart?.id === sample.chartId && approvedBom(sample.styleId) && !matchingPack) actions.push(actionButton('\u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c Tech Pack', () => mutate('/v2/plm/tech-packs', { styleId: sample.styleId, fitSampleId: sample.id }), 'primary'));
  const card = entity(`${sample.styleCode} / ${sample.sampleType.toUpperCase()} ${sample.sampleNumber} / ${sample.size}`, sample.status, [
    `Chart r${sample.chartRevisionNumber}`,
    `Measured ${sample.result.measuredCount}/${sample.result.totalCount}`,
    `Verdict: ${sample.result.verdict}`,
    `Pass ${sample.result.passCount} / Fail ${sample.result.failCount}`,
    `v${sample.version}`,
  ], actions);
  if (sample.measurements.length) {
    const stack = el('div', { className: 'stack' });
    sample.measurements.forEach(item => stack.append(fitMeasurementCard(sample, item)));
    card.append(stack);
  }
  return card;
}

function fitMeasurementCard(sample, item) {
  const actions = sample.status === 'draft' && canManageTechnicalBrand(sample.brandId) ? [formButton(Number.isInteger(item.actualMm) ? '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c' : '\u0412\u0432\u0435\u0441\u0442\u0438', () => fitMeasurementForm(sample, item))] : [];
  const stateText = item.withinTolerance === true ? 'PASS' : item.withinTolerance === false ? 'FAIL' : 'PENDING';
  return entity(`${item.pointCode} / ${item.description}`, stateText, [
    `Target ${item.targetMm} mm`,
    `Actual ${Number.isInteger(item.actualMm) ? `${item.actualMm} mm` : '\u2014'}`,
    Number.isInteger(item.deviationMm) ? `Delta ${item.deviationMm} mm` : null,
    `Tol -${item.toleranceMinusMm}/+${item.tolerancePlusMm} mm`,
  ], actions);
}

function techPackCard(item) {
  return entity(`${item.styleCode} / Tech Pack r${item.revisionNumber}`, item.status, [
    `BOM r${item.sources?.bomRevisionNumber || '\u2014'}`,
    `Measurement r${item.sources?.measurementChartRevisionNumber || '\u2014'}`,
    `Fit ${item.sources?.fitSampleId || '\u2014'}`,
    `Generated ${formatDate(item.generatedAt)}`,
  ], [formButton('\u041e\u0442\u043a\u0440\u044b\u0442\u044c manifest', () => showTechPackManifest(item))]);
}

function measurementChartForm(styles) {
  openForm('\u0421\u043e\u0437\u0434\u0430\u0442\u044c Measurement Chart', [selectDef('styleId', 'Style', styles, item => `${item.styleCode} / ${item.name}`)], values => mutate(`/v2/plm/styles/${encodeURIComponent(values.styleId)}/measurement-charts`, { styleId: values.styleId }));
}

function measurementPointForm(chart, point) {
  openForm(`${chart.styleCode} / POM`, [
    textDef('code', 'POM code', point?.code || ''),
    textDef('description', 'Description', point?.description || ''),
    numberDef('baseTargetMm', 'Base target, mm', point?.baseTargetMm ?? 0, true, { min: 0, max: 5000 }),
    numberDef('gradeStepMm', 'Grade step, mm', point?.gradeStepMm ?? 0, true, { min: -500, max: 500 }),
    numberDef('toleranceMinusMm', 'Tolerance -, mm', point?.toleranceMinusMm ?? 0, true, { min: 0, max: 500 }),
    numberDef('tolerancePlusMm', 'Tolerance +, mm', point?.tolerancePlusMm ?? 0, true, { min: 0, max: 500 }),
    textDef('manualTargets', 'Manual targets: S=500,L=540', manualTargetsText(point), { required: false }),
  ], values => {
    const code = values.code.trim().toUpperCase();
    return mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/points/${encodeURIComponent(code)}`, {
      chartId: chart.id,
      pointCode: code,
      code,
      description: values.description.trim(),
      baseTargetMm: values.baseTargetMm,
      gradeStepMm: values.gradeStepMm,
      toleranceMinusMm: values.toleranceMinusMm,
      tolerancePlusMm: values.tolerancePlusMm,
      manualTargetsMm: parseManualTargets(values.manualTargets, chart.sizeGrid.sizes),
    }, 'PUT');
  });
}

function fitSampleForm(chart) {
  const existing = (state.workspace.fitSamples || []).filter(item => item.chartId === chart.id);
  const nextNumber = existing.reduce((max, item) => Math.max(max, item.sampleNumber), 0) + 1;
  openForm(`${chart.styleCode} / Fit Sample`, [
    selectDef('sampleType', 'Sample type', ['proto','fit','size-set','pps'], undefined, { value: 'fit' }),
    numberDef('sampleNumber', 'Sample number', nextNumber, true, { min: 1, max: 9999 }),
    selectDef('size', 'Size', chart.sizeGrid.sizes, undefined, { value: chart.sizeGrid.baseSize }),
    textDef('notes', 'Notes', '', { required: false }),
  ], values => mutate(`/v2/plm/measurement-charts/${encodeURIComponent(chart.id)}/fit-samples`, { chartId: chart.id, sampleType: values.sampleType, sampleNumber: values.sampleNumber, size: values.size, notes: values.notes.trim() }));
}

function fitMeasurementForm(sample, item) {
  openForm(`${sample.styleCode} / ${item.pointCode}`, [numberDef('actualMm', 'Actual, mm', item.actualMm ?? item.targetMm, true, { min: 0, max: 5000 })], values => mutate(`/v2/plm/fit-samples/${encodeURIComponent(sample.id)}/measurements/${encodeURIComponent(item.pointCode)}`, { sampleId: sample.id, pointCode: item.pointCode, actualMm: values.actualMm }, 'PUT'));
}
function rejectFitSampleForm(sample) {
  openForm('\u041e\u0442\u043a\u043b\u043e\u043d\u0438\u0442\u044c Fit Sample', [textDef('reason', '\u041f\u0440\u0438\u0447\u0438\u043d\u0430')], values => mutate(`/v2/plm/fit-samples/${encodeURIComponent(sample.id)}/reject`, { sampleId: sample.id, reason: values.reason.trim() }));
}
function manualTargetsText(point) { return point ? Object.entries(point.manualTargetsMm || {}).map(([size,value]) => `${size}=${value}`).join(',') : ''; }
function parseManualTargets(value, sizes) {
  const text = String(value || '').trim(); if (!text) return {};
  const result = {};
  text.split(',').forEach(token => {
    const parts = token.split('=').map(item => item.trim());
    if (parts.length !== 2 || !parts[0] || !/^[0-9]+$/.test(parts[1])) throw new Error('MANUAL_TARGET_FORMAT: use SIZE=millimetres separated by commas');
    const size = parts[0].toUpperCase();
    if (!sizes.includes(size)) throw new Error(`MANUAL_TARGET_SIZE: ${size} is outside size grid`);
    const amount = Number.parseInt(parts[1], 10);
    if (amount < 0 || amount > 5000) throw new Error(`MANUAL_TARGET_RANGE: ${parts[1]}`);
    result[size] = amount;
  });
  return result;
}

async function showTechPackManifest(item) {
  try {
    const data = await api(`/v2/plm/tech-packs/${encodeURIComponent(item.id)}/manifest`);
    const dialog = document.querySelector('#form-dialog'); clear(dialog);
    const body = el('div', { className: 'dialog-body' });
    const head = el('div', { className: 'dialog-head' });
    const close = el('button', { className: 'button small', text: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c', type: 'button' }); close.addEventListener('click', () => dialog.close());
    const pre = el('pre'); pre.textContent = JSON.stringify(data, null, 2); pre.style.whiteSpace = 'pre-wrap'; pre.style.overflowWrap = 'anywhere';
    head.append(el('h3', { text: `${item.styleCode} / Tech Pack r${item.revisionNumber}` }), close);
    body.append(head, pre); dialog.append(body); dialog.showModal();
  } catch (error) { toast(error.message, 'error'); }
}
