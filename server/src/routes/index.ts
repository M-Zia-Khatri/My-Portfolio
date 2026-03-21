import { Router } from "express";
import authRouter from "./auth.route";
import skillRouter from "../routes/skill.route"

const router = Router();

router.use("/auth", authRouter)
router.use("/skills", skillRouter)

export default router;
