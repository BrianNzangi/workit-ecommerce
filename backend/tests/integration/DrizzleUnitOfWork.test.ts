import { describe, it, expect, vi } from 'vitest';
import { DrizzleUnitOfWork } from '../../src/infrastructure/persistence/unit-of-work/DrizzleUnitOfWork.js';

describe('DrizzleUnitOfWork', () => {
  it('should execute work inside a transaction and return the result', async () => {
    const mockDb = {
      transaction: vi.fn(async <T>(fn: (tx: unknown) => Promise<T>) => fn({})),
    };

    const uow = new DrizzleUnitOfWork(mockDb as any);
    const result = await uow.transaction(async () => 42);

    expect(result).toBe(42);
    expect(mockDb.transaction).toHaveBeenCalledOnce();
  });

  it('should rollback (propagate error) when work throws', async () => {
    const mockDb = {
      transaction: vi.fn(async <T>(fn: (tx: unknown) => Promise<T>) => fn({})),
    };

    const uow = new DrizzleUnitOfWork(mockDb as any);

    await expect(
      uow.transaction(async () => {
        throw new Error('something went wrong');
      })
    ).rejects.toThrow('something went wrong');
  });

  it('should call db.transaction exactly once per execute call', async () => {
    const mockDb = {
      transaction: vi.fn(async <T>(fn: (tx: unknown) => Promise<T>) => fn({})),
    };

    const uow = new DrizzleUnitOfWork(mockDb as any);
    await uow.transaction(async () => 'done');

    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
  });
});
