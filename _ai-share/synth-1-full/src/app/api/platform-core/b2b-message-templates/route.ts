/**
 * @deprecated Compatibility shim — canonical path:
 * `/api/platform-core/b2b/message-templates`
 *
 * No duplicate handler logic; re-exports canonical BFF with auth + `{ templates }` shape.
 */
export { GET, POST, DELETE } from '../b2b/message-templates/route';
