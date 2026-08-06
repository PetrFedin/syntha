function renderProductDevelopment() {
  const box = el('div');
  const canManage = state.workspace.memberships.some(item => item.organisationType === 'brand' && ['owner', 'admin', 'product', 'sales'].includes(item.role));
  box.append(toolbar(
    '\u0420\u0430\u0437\u043c\u0435\u0440\u043d\u044b\u0435 \u0441\u0435\u0442\u043a\u0438 \u0438 Style \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438',
    canManage ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440\u043d\u0443\u044e \u0441\u0435\u0442\u043a\u0443' : '\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440',
    canManage ? sizeGridForm : () => toast('\u0420\u043e\u043b\u044c \u043d\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u0438\u0437\u0434\u0435\u043b\u0438\u0439.', 'error'),
  ));
  const grids = state.workspace.sizeGrids || [];
  const styles = state.workspace.styles || [];
  const grid = el('div', { className: 'grid two' });
  grid.append(
    sectionCard(
      '\u0420\u0430\u0437\u043c\u0435\u0440\u043d\u044b\u0435 \u0441\u0435\u0442\u043a\u0438',
      grids.length ? grids.map(sizeGridEntity) : [empty('\u0420\u0430\u0437\u043c\u0435\u0440\u043d\u044b\u0445 \u0441\u0435\u0442\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')],
    ),
    sectionCard(
      'Style',
      styles.length ? styles.map(styleEntity) : [empty('Style \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')],
      canManage ? '\u0421\u043e\u0437\u0434\u0430\u0442\u044c Style' : undefined,
      canManage ? styleForm : undefined,
    ),
  );
  box.append(grid);
  return box;
}

function canManageProductBrand(brandId) {
  return state.workspace.memberships.some(item => item.organisationId === brandId && item.organisationType === 'brand' && ['owner', 'admin', 'product', 'sales'].includes(item.role));
}

function sizeGridEntity(item) {
  const actions = canManageProductBrand(item.brandId) && item.status === 'draft'
    ? [actionButton('\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c', () => mutate(`/v2/plm/size-grids/${encodeURIComponent(item.id)}/publish`, { sizeGridId: item.id }), 'primary')]
    : [];
  return entity(item.name, item.status, [
    item.code,
    `Brand: ${orgName(item.brandId)}`,
    `${item.sizes.join(' / ')}`,
    `Base: ${item.baseSize}`,
    `v${item.version}`,
  ], actions);
}

function styleEntity(item) {
  const actions = [];
  if (canManageProductBrand(item.brandId) && item.status === 'draft') {
    actions.push(actionButton('\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c', () => mutate(`/v2/plm/styles/${encodeURIComponent(item.id)}/approve`, { styleId: item.id }), 'primary'));
  }
  if (canManageProductBrand(item.brandId) && item.status === 'approved') {
    actions.push(actionButton('\u0421\u043e\u0437\u0434\u0430\u0442\u044c SKU', () => styleSkuForm(item), 'primary'));
  }
  const variants = (state.workspace.catalogSkus || []).filter(sku => sku.productIdentity?.styleId === item.id);
  return entity(item.name, item.status, [
    item.styleCode,
    item.category,
    item.gender,
    `\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f: ${nameById('collections', item.collectionId)}`,
    `Size grid: ${item.sizeGrid.code} v${item.sizeGrid.version}`,
    `SKU variants: ${variants.length}`,
    `v${item.version}`,
  ], actions);
}

function sizeGridForm() {
  const manageableBrandIds = new Set(state.workspace.memberships.filter(item => item.organisationType === 'brand' && ['owner', 'admin', 'product', 'sales'].includes(item.role)).map(item => item.organisationId));
  const brands = ownOrganisations('brand').filter(item => manageableBrandIds.has(item.id));
  openForm('\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440\u043d\u0443\u044e \u0441\u0435\u0442\u043a\u0443', [
    selectDef('brandId', 'Brand', brands),
    textDef('code', '\u041a\u043e\u0434'),
    textDef('name', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'),
    textDef('sizes', '\u0420\u0430\u0437\u043c\u0435\u0440\u044b \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043f\u044f\u0442\u0443\u044e'),
    textDef('baseSize', '\u0411\u0430\u0437\u043e\u0432\u044b\u0439 \u0440\u0430\u0437\u043c\u0435\u0440'),
  ], values => mutate('/v2/plm/size-grids', {
    brandId: values.brandId,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    sizes: values.sizes.split(',').map(value => value.trim()).filter(Boolean),
    baseSize: values.baseSize.trim(),
  }));
}

function styleForm() {
  const manageableBrandIds = new Set(state.workspace.memberships.filter(item => item.organisationType === 'brand' && ['owner', 'admin', 'product', 'sales'].includes(item.role)).map(item => item.organisationId));
  const collections = state.workspace.collections.filter(item => manageableBrandIds.has(item.brandId));
  if (!collections.length) { toast('\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e.', 'error'); return; }
  const dialog = document.querySelector('#form-dialog'); clear(dialog);
  const body = el('div', { className: 'dialog-body' });
  const close = el('button', { className: 'button small', text: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c', type: 'button' });
  close.addEventListener('click', () => dialog.close());
  const head = el('div', { className: 'dialog-head' }); head.append(el('h3', { text: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c Style' }), close);
  const form = el('form');
  const formGrid = el('div', { className: 'form-grid' });
  const collectionField = buildField(selectDef('collectionId', '\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f', collections));
  const sizeGridLabel = el('label'); sizeGridLabel.append(el('span', { text: '\u0420\u0430\u0437\u043c\u0435\u0440\u043d\u0430\u044f \u0441\u0435\u0442\u043a\u0430' }));
  const sizeGridControl = el('select', { name: 'sizeGridId', required: true }); sizeGridLabel.append(sizeGridControl);
  const styleCode = buildField(textDef('styleCode', 'Style code'));
  const name = buildField(textDef('name', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'));
  const category = buildField(textDef('category', '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f'));
  const gender = buildField(selectDef('gender', 'Gender', ['women', 'men', 'unisex', 'kids', 'other']));
  formGrid.append(collectionField.label, sizeGridLabel, styleCode.label, name.label, category.label, gender.label);
  const submit = el('button', { className: 'button primary', text: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c', type: 'submit' });

  function syncSizeGrids() {
    clear(sizeGridControl);
    const collection = collections.find(item => item.id === collectionField.control.value);
    const grids = (state.workspace.sizeGrids || []).filter(item => item.brandId === collection?.brandId && item.status === 'published');
    if (!grids.length) {
      sizeGridControl.append(el('option', { value: '', text: '\u041d\u0435\u0442 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u0441\u0435\u0442\u043e\u043a' }));
      sizeGridControl.disabled = true;
      submit.disabled = true;
      return;
    }
    grids.forEach(item => sizeGridControl.append(el('option', { value: item.id, text: `${item.name} (${item.code})` })));
    sizeGridControl.disabled = false;
    submit.disabled = false;
  }
  collectionField.control.addEventListener('change', syncSizeGrids);
  syncSizeGrids();

  form.append(formGrid, submit);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    setButtonBusy(submit, true, '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u043c\u2026');
    try {
      const collection = collections.find(item => item.id === collectionField.control.value);
      await mutate('/v2/plm/styles', {
        brandId: collection.brandId,
        collectionId: collection.id,
        styleCode: styleCode.control.value.trim().toUpperCase(),
        name: name.control.value.trim(),
        category: category.control.value.trim(),
        gender: gender.control.value,
        sizeGridId: sizeGridControl.value,
      });
      dialog.close(); await reload(); renderApp(); toast('\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b', 'success');
    } catch (error) { showInlineError(form, error.message); }
    finally { if (submit.isConnected) setButtonBusy(submit, false, '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'); }
  });
  body.append(head, form); dialog.append(body); dialog.showModal();
}

function styleSkuForm(style) {
  const collection = state.workspace.collections.find(item => item.id === style.collectionId);
  if (!collection) { toast('\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f Style \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.', 'error'); return; }
  openForm(`SKU \u0434\u043b\u044f ${style.styleCode}`, [
    selectDef('sizeLabel', '\u0420\u0430\u0437\u043c\u0435\u0440', style.sizeGrid.sizes),
    textDef('colorCode', '\u041a\u043e\u0434 \u0446\u0432\u0435\u0442\u0430'),
    textDef('sku', 'SKU'),
    textDef('name', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'),
    numberDef('wholesalePrice', 'Wholesale price', 0, false),
    numberDef('minimumOrderQuantity', 'MOQ', 1, true),
    numberDef('availableQuantity', 'Sellable quantity', 0, true),
  ], values => mutate(`/v2/plm/styles/${encodeURIComponent(style.id)}/skus`, {
    styleId: style.id,
    collectionId: collection.id,
    brandId: style.brandId,
    sizeLabel: values.sizeLabel,
    colorCode: values.colorCode.trim().toUpperCase(),
    sku: values.sku.trim().toUpperCase(),
    name: values.name.trim(),
    wholesalePrice: values.wholesalePrice,
    currency: collection.currency,
    minimumOrderQuantity: values.minimumOrderQuantity,
    availableQuantity: values.availableQuantity,
  }));
}
