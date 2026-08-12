import * as Joi from 'joi';

/**
 * Validates process environment at application boot.
 * If a required variable is missing or malformed, Nest fails fast on startup
 * instead of surfacing an obscure runtime error later.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
});
