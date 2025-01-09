import dotenvFlow from 'dotenv-flow';
import { z, ZodError } from 'zod';
dotenvFlow.config();

const envSchema = z.object({
  ENV: z.string(),
  PORT: z.coerce.number(),
  SERVER_URL: z.string().min(1),

  // Database
  DB_URL: z.string().min(1)
});

try {
  envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    // console.error('Enviroment Calidation Error : ', error);
  }
}

export default {
  //General Configuration
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SERVER_URL: process.env.SERVER_URL,

  // Database
  DATABASE_URL: process.env.DATABASE_URL
};
