const mutationHeaders = [{ name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', minLength: 1 } }];
const auth = [{ bearerAuth: [] }];

export const wholesaleV2OpenApi = Object.freeze({
  openapi: '3.1.0',
  info: { title: 'Syntha Wholesale V2 API', version: '0.10.0' },
  servers: [{ url: '/v2' }],
  'x-operational-endpoints': Object.freeze({ liveness: '/health', readiness: '/ready', specification: '/openapi.json' }),
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Opaque Syntha V2 session token' } },
    schemas: {
      Error: {
        type: 'object', required: ['error', 'requestId'],
        properties: {
          error: { type: 'object', required: ['code', 'message', 'details'], properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'object' } } },
          requestId: { type: 'string' },
        },
      },
      LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 12, maxLength: 1024 } } },
      CatalogSkuCreate: {
        type: 'object',
        required: ['sku', 'collectionId', 'brandId', 'name', 'wholesalePrice', 'currency', 'minimumOrderQuantity', 'availableQuantity'],
        additionalProperties: false,
        properties: {
          sku: { type: 'string', pattern: '^[A-Z0-9][A-Z0-9._-]{1,63}$' },
          collectionId: { type: 'string' },
          brandId: { type: 'string' },
          name: { type: 'string', minLength: 2 },
          wholesalePrice: { type: 'number', exclusiveMinimum: 0 },
          currency: { type: 'string', pattern: '^[A-Z]{3}$' },
          minimumOrderQuantity: { type: 'integer', minimum: 1 },
          availableQuantity: { type: 'integer', minimum: 0 },
        },
      },
      SizeGridCreate: {
        type: 'object',
        required: ['brandId', 'code', 'name', 'sizes', 'baseSize'],
        additionalProperties: false,
        properties: {
          brandId: { type: 'string', minLength: 1 },
          code: { type: 'string', pattern: '^[A-Z0-9][A-Z0-9._-]{1,39}$' },
          name: { type: 'string', minLength: 2, maxLength: 120 },
          sizes: { type: 'array', minItems: 2, maxItems: 40, uniqueItems: true, items: { type: 'string', minLength: 1, maxLength: 16 } },
          baseSize: { type: 'string', minLength: 1, maxLength: 16 },
        },
      },
      StyleCreate: {
        type: 'object',
        required: ['brandId', 'collectionId', 'styleCode', 'name', 'category', 'gender', 'sizeGridId'],
        additionalProperties: false,
        properties: {
          brandId: { type: 'string', minLength: 1 },
          collectionId: { type: 'string', minLength: 1 },
          styleCode: { type: 'string', pattern: '^[A-Z0-9][A-Z0-9._-]{1,39}$' },
          name: { type: 'string', minLength: 2, maxLength: 120 },
          category: { type: 'string', minLength: 2, maxLength: 120 },
          gender: { type: 'string', enum: ['women', 'men', 'unisex', 'kids', 'other'] },
          sizeGridId: { type: 'string', minLength: 1 },
        },
      },
      SelectionLineInput: {
        type: 'object', required: ['sku', 'quantity'], additionalProperties: false,
        properties: { sku: { type: 'string' }, quantity: { type: 'integer', minimum: 1 }, note: { type: 'string' } },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        operationId: 'login',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          200: { description: 'Session created' }, 400: { description: 'Invalid credentials payload' }, 401: { description: 'Invalid credentials' },
          429: { description: 'Too many login attempts', headers: { 'Retry-After': { schema: { type: 'integer', minimum: 1 } } } },
        },
      },
    },
    '/auth/me': { get: { operationId: 'currentUser', security: auth, responses: { 200: { description: 'Current authenticated user' }, 401: { description: 'Authentication required' } } } },
    '/auth/logout': { post: { operationId: 'logout', security: auth, responses: { 200: { description: 'Session revoked' }, 401: { description: 'Authentication required' } } } },
    '/campaigns': { post: operation('createCampaign') },
    '/campaigns/{campaignId}/open': { post: operation('openCampaign', ['campaignId']) },
    '/collections': { post: operation('createCollection') },
    '/collections/{collectionId}/publish': { post: operation('publishCollection', ['collectionId']) },
    '/catalog/skus': { post: { ...operation('createCatalogSku'), requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CatalogSkuCreate' } } } } } },
    '/catalog/skus/{sku}/publish': { post: operation('publishCatalogSku', ['sku']) },
    '/plm/size-grids': { post: { ...operation('createSizeGrid'), requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SizeGridCreate' } } } } } },
    '/plm/size-grids/{sizeGridId}/publish': { post: operation('publishSizeGrid', ['sizeGridId']) },
    '/plm/styles': { post: { ...operation('createStyle'), requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StyleCreate' } } } } } },
    '/plm/styles/{styleId}/approve': { post: operation('approveStyle', ['styleId']) },
    '/showrooms': { post: operation('createShowroom') },
    '/showrooms/{showroomId}/open': { post: operation('openShowroom', ['showroomId']) },
    '/relationships': { post: operation('requestRelationship') },
    '/relationships/{relationshipId}/accept': { post: operation('acceptRelationship', ['relationshipId']) },
    '/showrooms/{showroomId}/invitations': { post: operation('inviteShopToShowroom', ['showroomId']) },
    '/invitations/{invitationId}/accept': { post: operation('acceptShowroomInvitation', ['invitationId']) },
    '/cycles': { post: operation('startCycle') },
    '/cycles/{cycleId}/advance': { post: operation('advanceCycle', ['cycleId']) },
    '/cycles/{cycleId}/confirm': { post: operation('confirmAndOpenDeal', ['cycleId']) },
    '/selections': { post: operation('createSelection') },
    '/selections/{selectionId}/lines/{sku}': { put: { ...operation('upsertSelectionLine', ['selectionId', 'sku']), requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SelectionLineInput' } } } } } },
    '/selections/{selectionId}/submit': { post: operation('submitSelection', ['selectionId']) },
    '/orders': { post: operation('createOrderDraft') },
    '/orders/{orderId}/accept': { post: operation('acceptOrderTerms', ['orderId']) },
    '/orders/{orderId}/attach': { post: operation('attachOrderToCycle', ['orderId']) },
    '/orders/{orderId}/cancel': { post: operation('cancelOrder', ['orderId']) },
    '/workspace': { get: { operationId: 'loadWorkspace', security: auth, responses: { 200: { description: 'Actor workspace' } } } },
    '/notifications': { get: { operationId: 'listNotifications', security: auth, responses: { 200: { description: 'Notifications' } } } },
    '/notifications/{notificationId}/read': { post: operation('markNotificationRead', ['notificationId']) },
  },
});

function operation(operationId, pathNames = []) {
  return {
    operationId,
    security: auth,
    parameters: [...pathNames.map((name) => ({ name, in: 'path', required: true, schema: { type: 'string', minLength: 1 } })), ...mutationHeaders],
    requestBody: { required: false, content: { 'application/json': { schema: { type: 'object' } } } },
    responses: {
      200: { description: 'Success' },
      400: { description: 'Invalid transport request' },
      401: { description: 'Authentication required' },
      403: { description: 'Capability denied' },
      409: { description: 'Conflict' },
      422: { description: 'Domain validation failed, including lifecycle, MOQ or availability failures' },
    },
  };
}
