import {
  bumpPlatformCoreB2bRegistry,
  subscribePlatformCoreB2bRegistry,
} from '@/lib/server/platform-core-b2b-registry-hub';

jest.mock('@/lib/server/workshop2-redis-pubsub', () => ({
  isWorkshop2RedisConfigured: jest.fn(() => false),
  publishWorkshop2RedisEvent: jest.fn(),
  subscribeWorkshop2RedisRoom: jest.fn(),
}));

describe('platform-core-b2b-registry-hub', () => {
  it('уведомляет локальных подписчиков при bump', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePlatformCoreB2bRegistry(listener);
    bumpPlatformCoreB2bRegistry('b2b.order.status_changed');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('b2b.order.status_changed');
    unsubscribe();
    bumpPlatformCoreB2bRegistry('b2b.order.status_changed');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
