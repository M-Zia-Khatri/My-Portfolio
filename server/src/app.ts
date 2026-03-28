import cors from 'cors';
import express from 'express';
import './lib/utills/redis.ts';
import routes from './routes/index.ts';
import cookieParser from 'cookie-parser';


const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

export default app;
