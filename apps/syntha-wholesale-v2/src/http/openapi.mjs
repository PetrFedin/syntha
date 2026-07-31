const mutationHeaders = [{ name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', minLength: 1 } }];
const auth = [{ bearerAuth: [] }];

export const wholesaleV2OpenApi = Object.freeze({
  openapi: '3.1.0',
  info: { title: 'Syntha Wholesale V2 API', version: '0.3.0' },
  servers: [{ url: '/v2' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Firebase ID token' } },
    schemas: {
      Error: {
        type: 'object',
        required: ['error', 'requestId'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'details'],
            properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'object' } },
          },
          requestId: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': { get: { operationId: 'health', responses: { 200: { description: 'Healthy' } } } },
    '/campaigns': { post: operation('createCampaign') },
    '/campaigns/{campaignId}/open': { post: operation('openCampaign', ['campaignId']) },
    '/collections': { post: operation('createCollection') },
    '/collections/{collectionId}/publish': { post: operation('publishCollection', ['collectionId']) },
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
    '/selections/{selectionId}/lines/{sku}': { put: operation('upsertSelectionLine', ['selectionId', 'sku']) },
    '/selections/{selectionId}/submit': { post: operation('submitSelection', ['selectionId']) },
    '/orders': { post: operation('createOrderDraft') },
    '/orders/{orderId}/accept': { post: operation('acceptOrderTerms', ['orderId']) },
    '/orders/{orderId}/attach': { post: operation('attachOrderToCycle', ['orderId']) },
    '/workspace': { get: { operationId: 'loadWorkspace', security: auth, responses: { 200: { description: 'Actor workspace' } } } },
    '/notifications': { get: { operationId: 'listNotifications', security: auth, responses: { 200: { description: 'Notifications' } } } },
    '/notifications/{notificationId}/read': { post: operation('markNotificationRead', ['notificationId']) },
  },
});

function operation(operationId, pathNames = []) {
  return {
    operationId,
    security: auth,
    parameters: [
      ...pathNames.map((name) => ({ name, in: 'path', required: true, schema: { type: 'string', minLength: 1 } })),
      ...mutationHeaders,
    ],
    requestBody: { required: false, content: { 'application/json': { schema: { type: 'object' } } } },
    responses: {
      200: { description: 'Success' },
      400: { description: 'Invalid transport request' },
      401: { description: 'Authentication required' },
      403: { description: 'Capability denied' },
      409: { description: 'Conflict' },
      422: { description: 'Domain validation failed' },
    },
  };
}
