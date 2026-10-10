import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    role: z.enum(['ADMIN', 'PRODUCTION_MANAGER', 'INVENTORY_MANAGER', 'DYEING_SUPERVISOR', 'WEAVING_SUPERVISOR', 'QC_INSPECTOR', 'WAREHOUSE_STAFF']),
    department: z.enum(['SPINNING', 'WEAVING', 'DYEING', 'FINISHING', 'PACKAGING', 'WAREHOUSE', 'MANAGEMENT'])
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  })
});
