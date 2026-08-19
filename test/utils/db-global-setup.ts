import { config } from 'dotenv';
import { ensureTestDatabase, runMigrations } from './db';

export default async function globalSetup(): Promise<void> {
  // globalSetup runs before Jest's setupFiles, so load .env here. Set NODE_ENV
  // first so the database module selects the test database (dotenv does not
  // override existing environment variables).
  process.env.NODE_ENV = 'test';
  config({ path: '.env' });
  await ensureTestDatabase();
  await runMigrations();
}
