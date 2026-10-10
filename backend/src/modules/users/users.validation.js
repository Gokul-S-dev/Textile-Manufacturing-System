import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    department: z.string().optional(),
    roles: z.array(z.string()).min(1)
  })
});

export const updateRolesSchema = z.object({
  body: z.object({
    roles: z.array(z.string()).min(1)
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8)
  })
});
