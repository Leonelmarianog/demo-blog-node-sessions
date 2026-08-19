import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  APP_PORT: Joi.number().port().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_TEST_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),

  SESSION_SECRET: Joi.string().min(32).required(),
  APP_BASE_URL: Joi.string().uri().required(),
  VERIFICATION_TOKEN_TTL_SECONDS: Joi.number().integer().min(60).required(),
});
