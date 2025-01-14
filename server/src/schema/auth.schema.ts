import { z } from 'zod';

const signUpSchema = z.object({
  username: z.string().min(5).max(15),
  fullname: z.string().min(5).max(25),
  email: z.string().email('Invalid email format').min(12),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(15)
});

const basicLoginSchema = z.object({
  username: z.string().min(5).max(15).optional(),
  email: z.string().min(12).optional(),
  password: z.string().min(8).max(15)
});

const loginSchema = basicLoginSchema.refine((data) => data.email || data.username, {
  message: 'Either Username or Email must be provided',
  path: ['username', 'email']
});

export { signUpSchema, loginSchema };
