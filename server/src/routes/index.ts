import { Router } from 'express';
import skillRouter from '../routes/skill.route';
import authRouter from './auth.route';
import contactRouter from './contact.route';
import portfolioRouter from './portfolio.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/skills', skillRouter);
router.use('/portfolio', portfolioRouter);
router.use('/contact', contactRouter);

export default router;
