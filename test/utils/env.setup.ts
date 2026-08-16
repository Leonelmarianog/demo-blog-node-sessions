import { config } from 'dotenv';

// Loaded by Jest before each e2e suite. Tests never go through main.ts, so set
// NODE_ENV here so ConfigModule and the database module select the test database.
process.env.NODE_ENV = 'test';
config({ path: '.env' });
