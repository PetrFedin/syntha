export class OrderPersistenceVersionConflict extends Error {
  constructor(readonly orderId: string) {
    super(`Order ${orderId} was modified by another persistence operation`);
    this.name = 'OrderPersistenceVersionConflict';
  }
}

export class OrderReviewPersistenceVersionConflict extends Error {
  constructor(readonly orderReviewId: string) {
    super(`Order review ${orderReviewId} was modified by another persistence operation`);
    this.name = 'OrderReviewPersistenceVersionConflict';
  }
}
