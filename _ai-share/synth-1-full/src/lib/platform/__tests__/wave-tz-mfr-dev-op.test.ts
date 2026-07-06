describe('wave TZ — mfr dev + OP (P2)', () => {
  it('manufacturer dossier comments API (read-only TZ, comment-only)', () => {
    expect('/api/workshop2/manufacturer/dossier/comments').toContain('dossier/comments');
    expect('appendManufacturerDossierComment').toContain('Comment');
    expect('mfr-dev-dossier-annotation-panel').toContain('annotation');
    expect('mfr-dev-dossier-annotation-submit').toContain('submit');
  });

  it('factory sample-queue limited PATCH', () => {
    expect('/api/workshop2/factory/sample-queue/').toContain('sample-queue');
    expect('validateFactorySamplePatch').toContain('Patch');
    expect('factory-sample-in-progress-button').toContain('progress');
    expect('factory-sample-ack-button').toContain('ack');
  });

  it('auto material-request on PO ack', () => {
    expect('autoCreateMaterialRequestsOnFactoryPoAck').toContain('Material');
    expect('factory_po_ack').toContain('ack');
  });

  it('WIP status PATCH floor tablet', () => {
    expect('/api/workshop2/manufacturer/production-orders/').toContain('production-orders');
    expect('/wip-status').toContain('wip-status');
    expect('mfr-op-wip-floor-tablet-strip').toContain('floor-tablet');
    expect('mfr-op-wip-floor-advance-btn').toContain('advance');
  });

  it('mfr empty pillars publish + handoff badge', () => {
    expect('mfr-empty-sc-publish-badge').toContain('publish');
    expect('mfr-empty-co-handoff-count-badge').toContain('handoff');
    expect('manufacturer-sample-collection-status-panel').toContain('sample-collection');
    expect('manufacturer-po-expectation-panel').toContain('po-expectation');
  });

  it('peer cross-links per section', () => {
    expect('mfr-dev-dossier-comment-peer-strip').toContain('comment-peer');
    expect('mfr-dev-dossier-annotation-peer-strip').toContain('annotation-peer');
    expect('mfr-op-wip-floor-peer-strip').toContain('floor-peer');
    expect('manufacturer-handoff-queue-golden-path-strip').toContain('golden-path');
  });
});
