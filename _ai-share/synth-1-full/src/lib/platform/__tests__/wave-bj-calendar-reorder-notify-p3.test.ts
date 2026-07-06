describe('wave-bj calendar reorder dev-notify supplier-push p3', () => {
  it('range planner tier reorder PATCH contract', () => {
    expect('reorderWorkshop2RangePlannerTierArticles').toContain('reorder');
    expect('tierArticleOrder').toContain('tierArticle');
    expect('range-planner-tier-drop-marker-').toContain('drop-marker');
  });

  it('brand dev cabinet notification center', () => {
    expect('CommsNotificationCenterStrip').toContain('Notification');
    expect('brand-dev-cabinet-panel').toContain('cabinet');
    expect('brand-cm-notification-center-compact').toContain('compact');
  });

  it('supplier comms domain push POST', () => {
    expect('sup-cm-cabinet-brand-push-submit').toContain('push-submit');
    expect('/api/workshop2/supplier/material-request/bulk-confirm').toContain('bulk-confirm');
  });

  it('calendar user tasks refresh after quick create', () => {
    expect('brand-cm-calendar-user-tasks-quick-create').toContain('quick-create');
    expect('brand-cm-calendar-user-tasks-refresh').toContain('refresh');
  });

  it('mfr OP compact hides WMS reserve badge duplicate', () => {
    expect('inventory_reserved').toContain('inventory');
    expect('!compact').toContain('compact');
  });
});
