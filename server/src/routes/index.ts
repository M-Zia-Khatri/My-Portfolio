import { Router } from "express";
import authRouter from "./auth.route";
import skillRouter from "../routes/skill.route"
import portfolioRouter from "./portfolio.route";

const router = Router();

router.use("/auth", authRouter)
router.use("/skills", skillRouter)
router.use("/portfolio", portfolioRouter)

export default router;
