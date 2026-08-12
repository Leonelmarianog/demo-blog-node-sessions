import { config } from 'dotenv';

// Loaded by Jest before each e2e suite so ConfigModule's Joi validation
// has NODE_ENV and APP_PORT available (tests don't go through main.ts).
config({ path: '.env' });
