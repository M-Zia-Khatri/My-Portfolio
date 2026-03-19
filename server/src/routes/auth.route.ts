import { login, logout, logoutAll, me, refresh, verifyOtpHandler } from "@/controllers/auth.controller"
import { requireAdmin } from "@/middlewares/auth.middleware"
import { Router } from "express"

const authRouter = Router()

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
authRouter.post("/login", login)            // Step 1: email + password
authRouter.post("/verify-otp", verifyOtpHandler) // Step 2: OTP → JWT pair
authRouter.post("/refresh", refresh)          // Rotate refresh token
authRouter.post("/logout", logout)           // Revoke current session

// ─── PROTECTED (requires valid access token) ──────────────────────────────────
authRouter.post("/logout-all", requireAdmin, logoutAll) // Revoke all sessions
authRouter.get("/me", requireAdmin, me)        // Current admin profile

export default authRouter
