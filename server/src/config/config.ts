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

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // Redis
  REDIS_PORT: z.coerce.number(),
  REDIS_HOST: z.string(),
  REDIS_USERNAME: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_DB: z.coerce.number(),

  // Database
  DATABASE_URL: z.string().min(1)
});

try {
  envSchema.safeParse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    throw error;
  }
}

export default {
  //General Configuration
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SERVER_URL: `${process.env.SERVER_URL}:${process.env.PORT}`,

  // Token
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Redis
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: process.env.REDIS_DB
};
