// server/src/routes/skill.route.ts
import { Router } from "express"
import { requireAdmin } from "../middlewares/auth.middleware"
import * as skill from "../controllers/skill.controller"

const router = Router()

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/", skill.getAll)
router.get("/:id", skill.getOne)

// ─── Admin only ───────────────────────────────────────────────────────────────
router.use(requireAdmin)

router.post("/", skill.create)
router.patch("/:id", skill.update)
router.delete("/:id", skill.remove)

export default router
