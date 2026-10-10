import { z } from 'zod';

describe('Environment Validation', () => {
  it('should validate correctly when all required vars are present', () => {
    const envSchema = z.object({
      PORT: z.string().regex(/^\d+$/).default('5000'),
      DATABASE_URL: z.string().url(),
      JWT_SECRET: z.string().min(16),
    });

    const validEnv = {
      PORT: '5000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'this-is-a-long-secret-key',
    };

    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('should fail when JWT_SECRET is too short', () => {
    const envSchema = z.object({
      JWT_SECRET: z.string().min(16),
    });

    const result = envSchema.safeParse({ JWT_SECRET: 'short' });
    expect(result.success).toBe(false);
  });
});
