import { Router } from "express";
import authRouter from "./auth.route";
import skillRouter from "../routes/skill.route";
import portfolioRouter from "./portfolio.route";
import contactRouter from "./contact.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/skills", skillRouter);
router.use("/portfolio", portfolioRouter);
router.use("/contact", contactRouter);

export default router;
