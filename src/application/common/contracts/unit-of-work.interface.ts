export const UNIT_OF_WORK = 'UNIT_OF_WORK';

/**
 * Opaque marker for the active database transaction.
 * The application layer declares it empty so it imports no ORM type.
 * The TypeOrmUnitOfWork casts it to a TypeORM EntityManager.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- opaque marker; ORM casts it to EntityManager
export interface TransactionContext {}

export interface UnitOfWork {
  execute<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
