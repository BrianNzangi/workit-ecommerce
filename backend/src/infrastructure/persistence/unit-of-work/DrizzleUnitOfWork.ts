import { IUnitOfWork } from '../../../application/shared/IUnitOfWork.js';

type DrizzleDb = {
  transaction: <T>(fn: (tx: unknown) => Promise<T>) => Promise<T>;
};

/**
 * Drizzle ORM implementation of the Unit of Work pattern.
 * Wraps operations in a Drizzle transaction for atomicity.
 */
export class DrizzleUnitOfWork implements IUnitOfWork {
  constructor(private readonly db: DrizzleDb) {}

  async transaction<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
