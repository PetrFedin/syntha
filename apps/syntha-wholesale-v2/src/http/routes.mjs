import { invariant } from '../core/errors.mjs';

export function createWholesaleRoutes({
  platform,
  catalog,
  productDevelopment,
  productSpecification,
  partners,
  collaboration,
  orders,
  notifications,
  workspace,
}) {
  invariant(platform && partners && collaboration && orders && notifications && workspace, 'HTTP_SERVICES_REQUIRED', 'All V2 application services are required');
  const catalogService = catalog ?? unavailableCatalog();
  const productDevelopmentService = productDevelopment ?? unavailableProductDevelopment();
  const productSpecificationService = productSpecification ?? unavailableProductSpecification();
  return [
    mutate('POST', /^\/v2\/campaigns$/, ({ commandId, actorId, body }) => platform.createCampaign(commandId, actorId, body)),
    mutate('POST', /^\/v2\/campaigns\/([^/]+)\/open$/, ({ commandId, actorId, params }) => platform.openCampaign(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/collections$/, ({ commandId, actorId, body }) => platform.createCollection(commandId, actorId, body)),
    mutate('POST', /^\/v2\/collections\/([^/]+)\/publish$/, ({ commandId, actorId, params }) => platform.publishCollection(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/catalog\/skus$/, ({ commandId, actorId, body }) => catalogService.createSku(commandId, actorId, body)),
    mutate('POST', /^\/v2\/catalog\/skus\/([^/]+)\/publish$/, ({ commandId, actorId, params }) => catalogService.publishSku(commandId, actorId, decodeURIComponent(params[0]))),
    mutate('POST', /^\/v2\/plm\/size-grids$/, ({ commandId, actorId, body }) => productDevelopmentService.createSizeGrid(commandId, actorId, body)),
    mutate('POST', /^\/v2\/plm\/size-grids\/([^/]+)\/publish$/, ({ commandId, actorId, params, body }) => {
      sameId(body.sizeGridId, params[0], 'sizeGridId');
      return productDevelopmentService.publishSizeGrid(commandId, actorId, params[0]);
    }),
    mutate('POST', /^\/v2\/plm\/styles$/, ({ commandId, actorId, body }) => productDevelopmentService.createStyle(commandId, actorId, body)),
    mutate('POST', /^\/v2\/plm\/styles\/([^/]+)\/skus$/, ({ commandId, actorId, params, body }) => {
      sameId(body.styleId, params[0], 'styleId');
      return catalogService.createSku(commandId, actorId, { ...body, styleId: params[0] });
    }),
    mutate('POST', /^\/v2\/plm\/styles\/([^/]+)\/approve$/, ({ commandId, actorId, params, body }) => {
      sameId(body.styleId, params[0], 'styleId');
      return productDevelopmentService.approveStyle(commandId, actorId, params[0]);
    }),
    mutate('POST', /^\/v2\/plm\/materials$/, ({ commandId, actorId, body }) => productSpecificationService.createMaterial(commandId, actorId, body)),
    mutate('POST', /^\/v2\/plm\/materials\/([^/]+)\/revisions$/, ({ commandId, actorId, params, body }) => {
      sameId(body.materialId, params[0], 'materialId');
      return productSpecificationService.createMaterialRevision(commandId, actorId, params[0], body.changes ?? {});
    }),
    mutate('POST', /^\/v2\/plm\/material-revisions\/([^/]+)\/approve$/, ({ commandId, actorId, params, body }) => {
      sameId(body.revisionId, params[0], 'revisionId');
      return productSpecificationService.approveMaterialRevision(commandId, actorId, params[0]);
    }),
    mutate('POST', /^\/v2\/plm\/boms$/, ({ commandId, actorId, body }) => productSpecificationService.createBom(commandId, actorId, body.styleId)),
    mutate('POST', /^\/v2\/plm\/boms\/([^/]+)\/revisions$/, ({ commandId, actorId, params, body }) => {
      sameId(body.bomId, params[0], 'bomId');
      return productSpecificationService.reviseBom(commandId, actorId, params[0]);
    }),
    mutate('PUT', /^\/v2\/plm\/boms\/([^/]+)\/lines\/([^/]+)$/, ({ commandId, actorId, params, body }) => {
      const componentKey = decodeURIComponent(params[1]);
      sameId(body.bomId, params[0], 'bomId');
      sameId(body.componentKey, componentKey, 'componentKey');
      return productSpecificationService.upsertBomLine(commandId, actorId, params[0], { ...body, componentKey });
    }),
    mutate('DELETE', /^\/v2\/plm\/boms\/([^/]+)\/lines\/([^/]+)$/, ({ commandId, actorId, params, body }) => {
      const componentKey = decodeURIComponent(params[1]);
      sameId(body.bomId, params[0], 'bomId');
      sameId(body.componentKey, componentKey, 'componentKey');
      return productSpecificationService.removeBomLine(commandId, actorId, params[0], componentKey);
    }),
    mutate('POST', /^\/v2\/plm\/boms\/([^/]+)\/submit$/, ({ commandId, actorId, params, body }) => {
      sameId(body.bomId, params[0], 'bomId');
      return productSpecificationService.submitBom(commandId, actorId, params[0]);
    }),
    mutate('POST', /^\/v2\/plm\/boms\/([^/]+)\/approve$/, ({ commandId, actorId, params, body }) => {
      sameId(body.bomId, params[0], 'bomId');
      return productSpecificationService.approveBom(commandId, actorId, params[0]);
    }),
    mutate('POST', /^\/v2\/showrooms$/, ({ commandId, actorId, body }) => collaboration.createShowroom(commandId, actorId, body)),
    mutate('POST', /^\/v2\/showrooms\/([^/]+)\/open$/, ({ commandId, actorId, params }) => collaboration.openShowroom(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/relationships$/, ({ commandId, actorId, body }) => partners.requestRelationship(commandId, actorId, body)),
    mutate('POST', /^\/v2\/relationships\/([^/]+)\/accept$/, ({ commandId, actorId, params }) => partners.acceptRelationship(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/showrooms\/([^/]+)\/invitations$/, ({ commandId, actorId, params, body }) => {
      sameId(body.showroomId, params[0], 'showroomId');
      return partners.inviteShopToShowroom(commandId, actorId, { ...body, showroomId: params[0] });
    }),
    mutate('POST', /^\/v2\/invitations\/([^/]+)\/accept$/, ({ commandId, actorId, params }) => partners.acceptShowroomInvitation(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/cycles$/, ({ commandId, actorId, body }) => platform.startCycle(commandId, actorId, body)),
    mutate('POST', /^\/v2\/cycles\/([^/]+)\/advance$/, ({ commandId, actorId, params, body }) => {
      sameId(body.cycleId, params[0], 'cycleId');
      return platform.advanceCycle(commandId, actorId, params[0], body.targetStage);
    }),
    mutate('POST', /^\/v2\/cycles\/([^/]+)\/confirm$/, ({ commandId, actorId, params }) => platform.confirmAndOpenDeal(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/selections$/, ({ commandId, actorId, body }) => collaboration.createSelection(commandId, actorId, body)),
    mutate('PUT', /^\/v2\/selections\/([^/]+)\/lines\/([^/]+)$/, ({ commandId, actorId, params, body }) => {
      const sku = decodeURIComponent(params[1]);
      sameId(body.selectionId, params[0], 'selectionId');
      sameId(body.sku, sku, 'sku');
      return collaboration.upsertSelectionLine(commandId, actorId, params[0], { ...body, sku });
    }),
    mutate('POST', /^\/v2\/selections\/([^/]+)\/submit$/, ({ commandId, actorId, params }) => collaboration.submitSelection(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/orders$/, ({ commandId, actorId, body }) => orders.createOrderDraft(commandId, actorId, body)),
    mutate('POST', /^\/v2\/orders\/([^/]+)\/accept$/, ({ commandId, actorId, params, body }) => {
      sameId(body.orderId, params[0], 'orderId');
      return orders.acceptTerms(commandId, actorId, { ...body, orderId: params[0] });
    }),
    mutate('POST', /^\/v2\/orders\/([^/]+)\/attach$/, ({ commandId, actorId, params }) => orders.attachOrderToCycle(commandId, actorId, params[0])),
    mutate('POST', /^\/v2\/orders\/([^/]+)\/cancel$/, ({ commandId, actorId, params, body }) => {
      sameId(body.orderId, params[0], 'orderId');
      return orders.cancelOrder(commandId, actorId, { orderId: params[0], reason: body.reason });
    }),
    read('GET', /^\/v2\/workspace$/, ({ actorId }) => workspace.loadForActor(actorId)),
    read('GET', /^\/v2\/notifications$/, ({ actorId }) => notifications.listForActor(actorId)),
    mutate('POST', /^\/v2\/notifications\/([^/]+)\/read$/, ({ commandId, actorId, params }) => notifications.markRead(commandId, actorId, params[0])),
  ];
}

export function matchWholesaleRoute(routes, method, pathname) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = pathname.match(route.pattern);
    if (match) return { ...route, params: match.slice(1) };
  }
  return null;
}

function mutate(method, pattern, execute) { return { method, pattern, execute, mutation: true }; }
function read(method, pattern, execute) { return { method, pattern, execute, mutation: false }; }
function sameId(bodyValue, routeValue, field) {
  invariant(bodyValue === undefined || bodyValue === routeValue, 'HTTP_IDENTIFIER_MISMATCH', 'Body identifier does not match route identifier', { field, routeValue, bodyValue });
}
function unavailableCatalog() {
  const fail = () => invariant(false, 'CATALOG_SERVICE_REQUIRED', 'Catalog service is required');
  return Object.freeze({ createSku: fail, publishSku: fail });
}
function unavailableProductDevelopment() {
  const fail = () => invariant(false, 'PRODUCT_DEVELOPMENT_SERVICE_REQUIRED', 'Product development service is required');
  return Object.freeze({ createSizeGrid: fail, publishSizeGrid: fail, createStyle: fail, approveStyle: fail });
}
function unavailableProductSpecification() {
  const fail = () => invariant(false, 'PRODUCT_SPECIFICATION_SERVICE_REQUIRED', 'Product specification service is required');
  return Object.freeze({
    createMaterial: fail,
    createMaterialRevision: fail,
    approveMaterialRevision: fail,
    createBom: fail,
    reviseBom: fail,
    upsertBomLine: fail,
    removeBomLine: fail,
    submitBom: fail,
    approveBom: fail,
  });
}
