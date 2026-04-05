import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import './lib/utills/redis.js';
import router from './routes/index.js';

const app = express();
const DEFAULT_ORIGIN = 'http://localhost:5173';
const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.CLIENT_URL ?? DEFAULT_ORIGIN)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/postman/server-to-server).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    exposedHeaders: ['ETag'],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

export default app;
