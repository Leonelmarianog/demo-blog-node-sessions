/**
 * A Unit of Work runs a set of writes as one atomic operation.
 *
 * It keeps multistep writes atomic. The writes all commit together. If any
 * step throws, they all roll back.
 */
export abstract class UnitOfWork {
  /**
   * Runs the given work inside a transaction and returns its result.
   * Repository calls inside the work join this transaction. If the work
   * throws, the transaction rolls back.
   */
  abstract execute<T>(work: () => Promise<T>): Promise<T>;
}
