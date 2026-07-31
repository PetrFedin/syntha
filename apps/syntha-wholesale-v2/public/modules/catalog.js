function renderCatalog() {
  const box = el('div');
  box.append(toolbar('\u041a\u0430\u043c\u043f\u0430\u043d\u0438\u0438 \u0438 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438', '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u044e', campaignForm));
  const grid = el('div', { className: 'grid two' });
  grid.append(sectionCard('\u041a\u0430\u043c\u043f\u0430\u043d\u0438\u0438', state.workspace.campaigns.length ? state.workspace.campaigns.map(campaignEntity) : [empty('\u041a\u0430\u043c\u043f\u0430\u043d\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')]),
    sectionCard('\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438', state.workspace.collections.length ? state.workspace.collections.map(collectionEntity) : [empty('\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.')], '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e', collectionForm));
  box.append(grid); return box;
}

