function renderProductSpecification() {
  const readableBrandIds = productSpecificationBrandIds('read');
  if (!readableBrandIds.size) return notice('\u0412\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0435 Material Library, BOM \u0438 costing \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0442\u0435\u043a\u0443\u0449\u0435\u0439 \u0440\u043e\u043b\u0438.');
  const box = el('div');
  const canManageAny = productSpecificationBrandIds('manage').size > 0;
  box.append(toolbar(
    'Material Library / revisions / BOM / deterministic costing',
    canManageAny ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b' : '\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440',
    canManageAny ? materialForm : () => toast('\u0420\u043e\u043b\u044c \u043d\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 \u043c\u0435\u043d\u044f\u0442\u044c costing.', 'error'),
  ));
  const materials = [...(state.workspace.materials || [])].sort((a, b) => a.code.localeCompare(b.code));
  const revisions = [...(state.workspace.materialRevisions || [])].sort((a, b) => a.materialCode.localeCompare(b.materialCode) || a.revisionNumber - b.revisionNumber);
  const boms = [...(state.workspace.boms || [])].sort((a, b) => a.styleCode.localeCompare(b.styleCode) || a.revisionNumber - b.revisionNumber);
  const grid = el('div', { className: 'grid two' });
  grid.append(
    sectionCard(
      'Material Library',
      materials.length ? materials.map(materialEntity) : [empty('\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')],
      canManageAny ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c' : undefined,
      canManageAny ? materialForm : undefined,
    ),
    sectionCard(
      '\u0420\u0435\u0432\u0438\u0437\u0438\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432',
      revisions.length ? revisions.map(materialRevisionEntity) : [empty('\u0420\u0435\u0432\u0438\u0437\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')],
    ),
  );
  box.append(grid);
  box.append(sectionCard(
    'BOM / Material Cost',
    boms.length ? boms.map(bomEntity) : [empty('BOM \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')],
    canManageAny ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c BOM' : undefined,
    canManageAny ? bomForm : undefined,
  ));
  return box;
}

function productSpecificationBrandIds(mode) {
  const roles = mode === 'manage' ? ['owner', 'admin', 'product'] : ['owner', 'admin', 'product', 'sales', 'finance'];
  return new Set(
    state.workspace.memberships
      .filter(item => item.organisationType === 'brand' && roles.includes(item.role))
      .map(item => item.organisationId),
  );
}

function canManageProductSpecificationBrand(brandId) {
  return productSpecificationBrandIds('manage').has(brandId);
}

function materialEntity(item) {
  const revisions = (state.workspace.materialRevisions || []).filter(candidate => candidate.materialId === item.id);
  const approved = revisions.find(candidate => candidate.status === 'approved');
  const draft = revisions.find(candidate => candidate.status === 'draft');
  const current = draft || approved || revisions.at(-1);
  const actions = [];
  if (canManageProductSpecificationBrand(item.brandId)) {
    if (draft) actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c r' + draft.revisionNumber, () => mutate(`/v2/plm/material-revisions/${encodeURIComponent(draft.id)}/approve`, { revisionId: draft.id }), 'primary'));
    if (approved && !draft) actions.push(formButton('\u041d\u043e\u0432\u0430\u044f \u0440\u0435\u0432\u0438\u0437\u0438\u044f', () => materialRevisionForm(item, approved)));
  }
  const spec = current?.specification;
  return entity(item.name, current?.status || item.status, [
    item.code,
    formatMaterialType(item.type),
    `Brand: ${orgName(item.brandId)}`,
    current ? `Revision: r${current.revisionNumber}` : null,
    spec ? `${formatMinorMoney(spec.unitCostMinor, spec.currency)} / ${spec.uom}` : null,
    spec?.supplierName ? `Supplier: ${spec.supplierName}` : null,
    Number.isInteger(spec?.leadTimeDays) ? `Lead time: ${spec.leadTimeDays} d` : null,
  ], actions);
}

function materialRevisionEntity(item) {
  const actions = [];
  if (item.status === 'draft' && canManageProductSpecificationBrand(item.brandId)) {
    actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c', () => mutate(`/v2/plm/material-revisions/${encodeURIComponent(item.id)}/approve`, { revisionId: item.id }), 'primary'));
  }
  const spec = item.specification;
  return entity(`${item.materialCode} / r${item.revisionNumber}`, item.status, [
    item.materialName,
    formatMaterialType(item.materialType),
    `${formatMinorMoney(spec.unitCostMinor, spec.currency)} / ${spec.uom}`,
    spec.composition || null,
    spec.colorCode ? `Color: ${spec.colorCode}` : null,
    spec.supplierName ? `Supplier: ${spec.supplierName}` : null,
    `Lead time: ${spec.leadTimeDays} d`,
    `v${item.version}`,
  ], actions);
}

function bomEntity(item) {
  const box = el('article', { className: 'entity' });
  const head = el('div', { className: 'entity-head' });
  head.append(el('div', { className: 'entity-title', text: `${item.styleCode} / BOM r${item.revisionNumber}` }), statusBadge(item.status));
  box.append(head);
  const meta = el('div', { className: 'meta' });
  [
    `Style v${item.styleVersion}`,
    `\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f: ${nameById('collections', item.collectionId)}`,
    `Material cost: ${formatMinorMoney(item.materialCostMinor, item.currency)}`,
    `Lines: ${item.lines.length}`,
    `BOM v${item.version}`,
  ].forEach(value => meta.append(el('span', { text: value })));
  box.append(meta);

  if (item.lines.length) {
    const lines = el('div', { className: 'stack' });
    item.lines.forEach(line => lines.append(bomLineEntity(item, line)));
    box.append(lines);
  }

  const actions = [];
  const canManage = canManageProductSpecificationBrand(item.brandId);
  if (canManage && item.status === 'draft') {
    actions.push(formButton('\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442', () => bomLineForm(item)));
    if (item.lines.length) actions.push(actionButton('\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043d\u0430 approval', () => mutate(`/v2/plm/boms/${encodeURIComponent(item.id)}/submit`, { bomId: item.id }), 'primary'));
  }
  if (canManage && item.status === 'submitted') {
    actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c BOM', () => mutate(`/v2/plm/boms/${encodeURIComponent(item.id)}/approve`, { bomId: item.id }), 'primary'));
  }
  if (canManage && item.status === 'approved' && !hasActiveBomRevision(item.styleId)) {
    actions.push(actionButton('\u0421\u043e\u0437\u0434\u0430\u0442\u044c r' + (item.revisionNumber + 1), () => mutate(`/v2/plm/boms/${encodeURIComponent(item.id)}/revisions`, { bomId: item.id })));
  }
  if (actions.length) { const row = el('div', { className: 'row' }); actions.forEach(action => row.append(action)); box.append(row); }
  return box;
}

function bomLineEntity(bom, line) {
  const box = el('div', { className: 'bom-line' });
  const head = el('div', { className: 'entity-head' });
  head.append(el('div', { className: 'entity-title', text: `${line.componentKey}: ${line.material.materialCode} r${line.material.revisionNumber}` }));
  box.append(head);
  const meta = el('div', { className: 'meta' });
  [
    line.componentRole,
    `${trimScaled(line.effectiveConsumptionMicrounits, 6)} ${line.material.uom}`,
    `Waste: ${trimScaled(line.wasteBasisPoints, 2)}%`,
    `Cost: ${formatMinorMoney(line.lineCostMinor, bom.currency)}`,
  ].forEach(value => meta.append(el('span', { text: value })));
  box.append(meta);
  if (bom.status === 'draft' && canManageProductSpecificationBrand(bom.brandId)) {
    const row = el('div', { className: 'row' });
    row.append(
      formButton('\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c', () => bomLineForm(bom, line)),
      actionButton('\u0423\u0434\u0430\u043b\u0438\u0442\u044c', () => mutate(
        `/v2/plm/boms/${encodeURIComponent(bom.id)}/lines/${encodeURIComponent(line.componentKey)}`,
        { bomId: bom.id, componentKey: line.componentKey },
        'DELETE',
      ), 'danger'),
    );
    box.append(row);
  }
  return box;
}

function materialForm() {
  const brandIds = productSpecificationBrandIds('manage');
  const brands = ownOrganisations('brand').filter(item => brandIds.has(item.id));
  openForm('\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b', [
    selectDef('brandId', 'Brand', brands),
    textDef('code', '\u041a\u043e\u0434'),
    textDef('name', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'),
    selectDef('type', '\u0422\u0438\u043f', ['fabric', 'trim', 'label', 'packaging', 'artwork', 'other']),
    selectDef('uom', 'UOM', ['m', 'kg', 'pcs', 'pair', 'set']),
    textDef('composition', '\u0421\u043e\u0441\u0442\u0430\u0432', '', { required: false }),
    textDef('colorCode', '\u041a\u043e\u0434 \u0446\u0432\u0435\u0442\u0430', '', { required: false }),
    textDef('supplierName', 'Supplier', '', { required: false }),
    textDef('unitCost', 'Unit cost'),
    textDef('currency', 'Currency', 'EUR'),
    numberDef('leadTimeDays', 'Lead time, days', 30, true, { max: 3650 }),
  ], values => {
    const currency = values.currency.trim().toUpperCase();
    return mutate('/v2/plm/materials', {
      brandId: values.brandId,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      type: values.type,
      specification: {
        uom: values.uom,
        composition: values.composition.trim(),
        colorCode: values.colorCode.trim().toUpperCase(),
        supplierName: values.supplierName.trim(),
        unitCostMinor: parseMoneyMinor(values.unitCost, currency),
        currency,
        leadTimeDays: values.leadTimeDays,
      },
    });
  });
}

function materialRevisionForm(material, approved) {
  const spec = approved.specification;
  openForm(`${material.code} / r${approved.revisionNumber + 1}`, [
    selectDef('uom', 'UOM', ['m', 'kg', 'pcs', 'pair', 'set'], undefined, { value: spec.uom }),
    textDef('composition', '\u0421\u043e\u0441\u0442\u0430\u0432', spec.composition || '', { required: false }),
    textDef('colorCode', '\u041a\u043e\u0434 \u0446\u0432\u0435\u0442\u0430', spec.colorCode || '', { required: false }),
    textDef('supplierName', 'Supplier', spec.supplierName || '', { required: false }),
    textDef('unitCost', 'Unit cost', minorMoneyString(spec.unitCostMinor, spec.currency)),
    textDef('currency', 'Currency', spec.currency),
    numberDef('leadTimeDays', 'Lead time, days', spec.leadTimeDays, true, { max: 3650 }),
  ], values => {
    const currency = values.currency.trim().toUpperCase();
    return mutate(`/v2/plm/materials/${encodeURIComponent(material.id)}/revisions`, {
      materialId: material.id,
      changes: {
        uom: values.uom,
        composition: values.composition.trim(),
        colorCode: values.colorCode.trim().toUpperCase(),
        supplierName: values.supplierName.trim(),
        unitCostMinor: parseMoneyMinor(values.unitCost, currency),
        currency,
        leadTimeDays: values.leadTimeDays,
      },
    });
  });
}

function bomForm() {
  const manageable = productSpecificationBrandIds('manage');
  const existingStyleIds = new Set((state.workspace.boms || []).map(item => item.styleId));
  const styles = (state.workspace.styles || []).filter(item => item.status === 'approved' && manageable.has(item.brandId) && !existingStyleIds.has(item.id));
  openForm('\u0421\u043e\u0437\u0434\u0430\u0442\u044c BOM', [
    selectDef('styleId', 'Style', styles, item => `${item.styleCode} / ${item.name}`),
  ], values => mutate('/v2/plm/boms', { styleId: values.styleId }));
}

function createBomForStyle(style) {
  return mutate('/v2/plm/boms', { styleId: style.id });
}

function bomLineForm(bom, line) {
  const approvedRevisions = (state.workspace.materialRevisions || []).filter(item =>
    item.brandId === bom.brandId && item.status === 'approved' && item.specification.currency === bom.currency,
  );
  if (!approvedRevisions.length) {
    toast('\u0414\u043b\u044f BOM \u043d\u0435\u0442 approved material revision \u0432 \u0432\u0430\u043b\u044e\u0442\u0435 ' + bom.currency + '.', 'error');
    return;
  }
  const currentRevisionId = line?.material?.revisionId;
  openForm(line ? `BOM ${bom.styleCode}: ${line.componentKey}` : `BOM ${bom.styleCode}: \u043d\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442`, [
    textDef('componentKey', 'Component key', line?.componentKey || '', { readonly: Boolean(line) }),
    textDef('componentRole', 'Component role', line?.componentRole || ''),
    selectDef('materialRevisionId', 'Approved material revision', approvedRevisions, item => `${item.materialCode} r${item.revisionNumber} / ${formatMinorMoney(item.specification.unitCostMinor, item.specification.currency)} / ${item.specification.uom}`, { value: currentRevisionId }),
    textDef('consumption', 'Consumption, material UOM', line ? trimScaled(line.consumptionMicrounits, 6) : '1'),
    textDef('wastePercent', 'Waste, %', line ? trimScaled(line.wasteBasisPoints, 2) : '0'),
  ], values => {
    const componentKey = values.componentKey.trim().toUpperCase();
    return mutate(`/v2/plm/boms/${encodeURIComponent(bom.id)}/lines/${encodeURIComponent(componentKey)}`, {
      bomId: bom.id,
      componentKey,
      componentRole: values.componentRole.trim(),
      materialRevisionId: values.materialRevisionId,
      consumptionMicrounits: parseScaledDecimal(values.consumption, 6, 'Consumption'),
      wasteBasisPoints: parseWasteBasisPoints(values.wastePercent),
    }, 'PUT');
  });
}

function hasActiveBomRevision(styleId) {
  return (state.workspace.boms || []).some(item => item.styleId === styleId && ['draft', 'submitted'].includes(item.status));
}

function formatMaterialType(type) {
  const labels = { fabric: 'Fabric', trim: 'Trim', label: 'Label', packaging: 'Packaging', artwork: 'Artwork', other: 'Other' };
  return labels[type] || type;
}

function currencyFractionDigits(currency) {
  const normalized = String(currency || '').trim().toUpperCase();
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: normalized }).resolvedOptions().maximumFractionDigits;
  } catch {
    throw new Error('Currency must be a valid three-letter ISO code.');
  }
}

function parseMoneyMinor(value, currency) {
  return parseScaledDecimal(value, currencyFractionDigits(currency), 'Unit cost');
}

function minorMoneyString(minor, currency) {
  return scaledIntegerString(minor, currencyFractionDigits(currency), false);
}

function formatMinorMoney(minor, currency) {
  const digits = currencyFractionDigits(currency);
  const factor = 10 ** digits;
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: String(currency).toUpperCase() }).format(Number(minor || 0) / factor);
}

function parseWasteBasisPoints(value) {
  const result = parseScaledDecimal(value, 2, 'Waste');
  if (result > 10_000) throw new Error('Waste must be between 0 and 100%.');
  return result;
}

function parseScaledDecimal(value, scale, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error(`${label} must be a non-negative decimal number.`);
  const [whole, rawFraction = ''] = normalized.split('.');
  if (rawFraction.length > scale && /[1-9]/.test(rawFraction.slice(scale))) throw new Error(`${label} supports at most ${scale} decimal places.`);
  const fraction = rawFraction.slice(0, scale).padEnd(scale, '0');
  const factor = 10n ** BigInt(scale);
  const result = BigInt(whole) * factor + BigInt(fraction || '0');
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${label} is too large.`);
  return Number(result);
}

function scaledIntegerString(value, scale, trim) {
  const integer = BigInt(value || 0);
  const factor = 10n ** BigInt(scale);
  const whole = integer / factor;
  if (!scale) return whole.toString();
  let fraction = (integer % factor).toString().padStart(scale, '0');
  if (trim) fraction = fraction.replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function trimScaled(value, scale) {
  return scaledIntegerString(value, scale, true);
}
