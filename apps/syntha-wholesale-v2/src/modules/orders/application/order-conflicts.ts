export class OrderPersistenceVersionConflict extends Error {
  constructor(readonly orderId: string) {
    super(`Order ${orderId} was modified by another persistence operation`);
    this.name = 'OrderPersistenceVersionConflict';
  }
}
