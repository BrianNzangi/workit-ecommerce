/**
 * Interface for the Unit of Work pattern.
 * Wraps a set of operations in a single database transaction.
 */
export interface IUnitOfWork {
  /**
   * Execute a function within a database transaction.
   * If the function throws, the transaction is rolled back.
   * If the function succeeds, the transaction is committed.
   */
  transaction<T>(work: () => Promise<T>): Promise<T>;
}
