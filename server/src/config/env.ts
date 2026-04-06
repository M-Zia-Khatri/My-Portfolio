import dotenv from 'dotenv';
import path from 'path';

let initialized = false;

function initialize() {
  if (initialized) return;

  const nodeEnv = process.env.NODE_ENV || 'development';
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${nodeEnv}`),
  });

  initialized = true;
}

export const getConfig = () => {
  initialize(); // Ensures dotenv runs before we read values

  return {
    isDev: process.env.NODE_ENV !== 'production',
    port: Number(process.env.PORT) || 5000,

    db: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },

    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
    },

    rateLimit: {
      bypass: process.env.RATE_LIMIT_BYPASS === 'true',
    },

    cors: {
      origins: process.env.CORS_ORIGINS,
    },

    client: {
      url: process.env.CLIENT_URL,
    },

    mailer: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
      adminEmail: process.env.SEED_ADMIN_EMAIL,
    },

    admin: {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      name: process.env.SEED_ADMIN_NAME,
    },

    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
    },

    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  };
};
