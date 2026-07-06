/** Wave VJ — shop CO tracking row chain-status mirror + materials push testids. */
export function shopCoTrackingChainStatusMirrorTestId(orderId: string): string {
  return `shop-co-tracking-chain-status-mirror-${orderId.trim()}`;
}

export function shopCoTrackingChainStatusMirrorSseTestId(orderId: string): string {
  return `${shopCoTrackingChainStatusMirrorTestId(orderId)}-sse-live`;
}

export function shopCoTrackingChainStatusMirrorPollTestId(orderId: string): string {
  return `${shopCoTrackingChainStatusMirrorTestId(orderId)}-poll`;
}

export function shopCoTrackingMaterialsPushTestId(orderId: string): string {
  return `shop-co-tracking-materials-push-${orderId.trim()}`;
}
