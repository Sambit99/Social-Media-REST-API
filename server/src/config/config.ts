import dotenvFlow from 'dotenv-flow';
import { z, ZodError } from 'zod';
dotenvFlow.config();

const envSchema = z.object({
  ENV: z.string(),
  PORT: z.coerce.number(),
  SERVER_URL: z.string().min(1),

  // Token
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRY: z.string(),

  // Database
  DATABASE_URL: z.string().min(1)
});

try {
  envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    throw error;
  }
}

export default {
  //General Configuration
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SERVER_URL: process.env.SERVER_URL,

  // Token
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

  // Database
  DATABASE_URL: process.env.DATABASE_URL
};
