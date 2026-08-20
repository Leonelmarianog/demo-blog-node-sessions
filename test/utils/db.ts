import { Client } from 'pg';
import type { DataSource } from 'typeorm';

const testDatabase = (): string => process.env.DB_TEST_NAME ?? 'demo_blog_test';

const connectionConfig = () => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/** Creates the test database if it does not exist. Safe to call every run. */
export async function ensureTestDatabase(): Promise<void> {
  const admin = new Client({ ...connectionConfig(), database: 'postgres' });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${testDatabase()}"`);
  } catch (error) {
    if (!String(error).includes('already exists')) {
      throw error;
    }
  } finally {
    await admin.end();
  }
}

/** Runs all pending migrations against the test database. */
export async function runMigrations(): Promise<void> {
  // Load the CLI data source via a relative path. In the Jest globalSetup
  // context the @infrastructure moduleNameMapper alias is not applied to
  // requires (it only applies to modules loaded by the test runtime), so a
  // relative path is required. The data source runs `new DataSource(...)`
  // at module-eval, so defer loading until env is set.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { default: dataSource } =
    require('../../src/infrastructure/database/cli/data-source') as {
      default: DataSource;
    };
  /* eslint-enable @typescript-eslint/no-require-imports */
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}

/** Truncates the auth tables so each test starts with empty data. */
export async function resetDatabase(): Promise<void> {
  const client = new Client({
    ...connectionConfig(),
    database: testDatabase(),
  });
  await client.connect();
  try {
    await client.query(
      'TRUNCATE users, verification_tokens, password_reset_tokens RESTART IDENTITY CASCADE',
    );
  } finally {
    await client.end();
  }
}
