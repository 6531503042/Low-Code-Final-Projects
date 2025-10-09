import { z } from 'zod';

export const envValidationSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SWAGGER_ENABLE: z.string().default('true').transform(val => val === 'true'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/meerai'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_TTL: z.string().default('60').transform(Number),
  RATE_LIMIT_LIMIT: z.string().default('120').transform(Number),
  DEFAULT_TIMEZONE: z.string().default('Asia/Bangkok'),
  CORS_ORIGINS: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof envValidationSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envValidationSchema.safeParse(config);
  
  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }
  
  return result.data;
}
