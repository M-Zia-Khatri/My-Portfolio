// src/middlewares/auth.middleware.ts
import { verifyAccessToken } from "@/lib/services/jwt.service"
import { AuthRequest } from "@/lib/types/auth.types"
import { ApiResponse } from "@/lib/types/globle.types"
import type { Response, NextFunction } from "express"

// ─── HELPER ───────────────────────────────────────────────────────────────────

function unauthorized(res: Response, message: string): void {
  const payload: ApiResponse = { success: false, status: 401, message }
  res.status(401).json(payload)
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    unauthorized(res, "Missing or malformed Authorization header")
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)

    if (payload.type !== "access") {
      unauthorized(res, "Invalid token type")
      return
    }

    req.admin = { id: payload.sub, email: payload.email }
    next()
  } catch (err: any) {
    const message =
      err?.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid access token"

    unauthorized(res, message)
  }
}
