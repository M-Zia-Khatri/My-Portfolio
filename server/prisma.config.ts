import dotenv from 'dotenv';
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Load env based on NODE_ENV
dotenv.config({
  path: `.env.${process.env.NODE_ENV ?? 'development'}`,
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
