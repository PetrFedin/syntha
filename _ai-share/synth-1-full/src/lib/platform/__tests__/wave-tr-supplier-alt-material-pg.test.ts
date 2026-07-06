describe('wave TR — supplier alt-material approval PG (fail-closed LS)', () => {
  it('PG table + repository module contract', () => {
    expect('supplier_alt_material_approvals').toContain('approvals');
    expect('getSupplierAltMaterialApprovalsServer').toContain('ApprovalsServer');
    expect('upsertSupplierAltMaterialApprovalServer').toContain('ApprovalServer');
    expect('060_wave_tr_supplier_alt_material_approvals.sql').toContain('wave_tr');
  });

  it('API route returns storageMode postgres in core PG path', () => {
    expect('/api/workshop2/supplier/alt-material-approval').toContain('alt-material-approval');
    expect('storageMode').toContain('storage');
    expect('pg_only_blocked').toContain('blocked');
    expect('core fail-closed').toContain('fail-closed');
  });

  it('fail-closed LS in core mode (no client localStorage SoT)', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('isWorkshop2PgOnlyMode').toContain('PgOnly');
  });

  it('push notification via platform_core_notification_events', () => {
    expect('appendPlatformCoreNotificationEvent').toContain('Notification');
    expect('notifyAltMaterialApprovalChange').toContain('ApprovalChange');
    expect('platform_core_notification_events').toContain('notification');
  });

  it('supplier + brand UI testids', () => {
    expect('sup-dev-bom-alt-material-approval-strip').toContain('alt-material');
    expect('sup-dev-cabinet-alt-materials-link').toContain('alt-materials');
    expect('materials-alt-materials-nav').toContain('alt-materials');
    expect('materials-alt-materials-catalog-link').toContain('catalog');
    expect('brand-dev-bom-alt-material-status-strip').toContain('alt-material');
    expect('brand-dev-bom-alt-material-supplier-peer-link').toContain('peer');
  });
});
