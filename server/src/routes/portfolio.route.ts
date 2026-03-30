import { rateLimit } from '@/middlewares/rate-limit/rate-limit.middleware';
import { Router } from 'express';
import {
  createPortfolioItem,
  deletePortfolioItem,
  getAllPortfolioItems,
  getPortfolioItemById,
  updatePortfolioItem,
} from '../controllers/portfolio.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const portfolioRouter = Router();

// Public
portfolioRouter
  .get(
    '/',
    rateLimit({
      action: 'portfolio-get-all',
      tiers: [
        { limit: 5, interval: 300 },
        {
          limit: 20,
          interval: 1800, // 1/2 hour
        },
      ],
      message: 'Too many get attempts. Try again later.',
    }),
    getAllPortfolioItems,
  )
  .get(
    '/:id',
    rateLimit({
      action: 'portfolio-get-one',
      tiers: [
        { limit: 5, interval: 300 },
        {
          limit: 20,
          interval: 1800, // 1/2 hour
        },
      ],
      message: 'Too many get attempts. Try again later.',
    }),
    getPortfolioItemById,
  );

// Admin only
portfolioRouter
  .use(
    rateLimit({
      action: 'portfolio-admin',
      tiers: [
        { limit: 10, interval: 600 },
        {
          limit: 25,
          interval: 1800, // 1/2 hour
        },
      ],
      message: 'Too many admin attempts. Try again later.',
    }),
  )
  .use(requireAdmin)
  .post('/', createPortfolioItem)
  .patch('/:id', updatePortfolioItem)
  .delete('/:id', deletePortfolioItem);

export default portfolioRouter;
