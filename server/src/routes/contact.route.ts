import { requireAdmin } from '@/middlewares/auth.middleware.js';
import { rateLimit } from '@/middlewares/rate-limit/rate-limit.middleware.js';
import { Router } from 'express';
import { deleteContact, getContacts, submitContact } from '../controllers/contact.controller.js';
import { validateContact } from '../middlewares/contact.middleware.js';

const contactRouter = Router();

contactRouter.post(
  '/',
  rateLimit({
    action: 'contact',
    tiers: [
      { limit: 2, interval: 300 },
      {
        limit: 8,
        interval: 1800, // 1/2 hour
      },
    ],
    message: 'Too many get attempts. Try again later.',
  }),
  validateContact,
  submitContact,
);

contactRouter
  .use(
    rateLimit({
      action: 'contact-admin',
      tiers: [
        { limit: 10, interval: 600 },
        {
          limit: 25,
          interval: 1800, // 1/2 hour
        },
      ],
      message: 'Too many get attempts. Try again later.',
    }),
  )
  .use(requireAdmin)
  .get('/', getContacts)
  .delete('/:id', deleteContact);

export default contactRouter;
