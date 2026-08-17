export abstract class UnitOfWork {
  /**
   * Runs the given work inside a transaction and returns its result.
   * Repository calls inside the work join this transaction. If the work
   * throws, the transaction rolls back.
   */
  abstract execute<T>(work: () => Promise<T>): Promise<T>;
}
