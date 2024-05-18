import { delay } from './common';

describe('delay', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should delay for the specified time', async () => {
    const time = 1000; // 1秒

    const promise = delay(time);

    // 快進計時器
    jest.advanceTimersByTime(time);

    // 等待 promise 被解決
    await expect(promise).resolves.toBeUndefined();
  });
});
