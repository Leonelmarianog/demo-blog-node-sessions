import { AsyncLocalStorage } from 'node:async_hooks';
import { EntityManager } from 'typeorm';

/**
 * Holds the EntityManager of the unit of work that is currently running.
 *
 * The Unit of Work stores the manager here for the duration of each
 * callback. Repository methods read it with {@link getCurrentManager} and
 * fall back to the default connection when no unit of work is running.
 *
 * This file is infrastructure only. The application layer does not import it.
 */
export const txStorage = new AsyncLocalStorage<EntityManager>();

/**
 * Returns the EntityManager of the unit of work that is currently running.
 * If no unit of work is running, returns the given fallback.
 */
export function getCurrentManager(fallback: EntityManager): EntityManager {
  return txStorage.getStore() ?? fallback;
}
