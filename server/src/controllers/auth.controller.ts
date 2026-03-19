// src/controllers/auth.controller.ts
import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import { sendOtpEmail } from "../lib/mailer"
import { ApiResponse, AuthRequest, LoginBody, RefreshBody, VerifyOtpBody } from "@/lib/types/auth.types"
import prisma from "@/lib/prisma"
import { generateOtp, verifyOtp } from "@/lib/services/otp.service"
import { catchError } from "@/lib/utills/catch-error"
import { revokeAllRefreshTokens, revokeRefreshToken, rotateRefreshToken, signAccessToken, signRefreshToken } from "@/lib/services/jwt.service"
import { send } from "@/lib/utills/send"

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Step 1 of 2: verify credentials → issue OTP

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = (req.body ?? {}) as LoginBody

    if (!email || !password) {
      send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: { fields: { email: !email, password: !password } },
      })
      return
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, fullName: true, passwordHash: true, isActive: true },
    })

    // Constant-time response to prevent user enumeration
    const dummyHash = "$2b$10$invalidhashfortimingprotection0zia00khatri000000000"
    const hashToCompare = admin?.passwordHash ?? dummyHash
    const passwordMatch = await bcrypt.compare(password, hashToCompare)

    if (!admin || !passwordMatch || !admin.isActive) {
      send(res, {
        success: false,
        status: 401,
        message: "Invalid credentials",
      })
      return
    }

    const otpCode = await generateOtp(admin.id)
    await sendOtpEmail(admin.email, admin.fullName, otpCode)

    send(res, {
      success: true,
      status: 200,
      message: "OTP sent to your registered email",
      data: { email: admin.email },
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── POST /auth/verify-otp ────────────────────────────────────────────────────
// Step 2 of 2: verify OTP → issue JWT pair

export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body as VerifyOtpBody

    if (!email || !otp) {
      send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: { fields: { email: !email, otp: !otp } },
      })
      return
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, isActive: true },
    })

    if (!admin || !admin.isActive) {
      send(res, { success: false, status: 401, message: "Invalid request" })
      return
    }

    const isValid = await verifyOtp(admin.id, otp.trim())

    if (!isValid) {
      send(res, {
        success: false,
        status: 401,
        message: "Invalid or expired OTP",
      })
      return
    }

    const accessToken = signAccessToken(admin.id, admin.email)
    const refreshToken = await signRefreshToken(admin.id)

    send(res, {
      success: true,
      status: 200,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 15 * 60,   // seconds
      },
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Rotate refresh token → issue new JWT pair

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshBody

    if (!refreshToken) {
      send(res, { success: false, status: 400, message: "refreshToken is required" })
      return
    }

    const tokens = await rotateRefreshToken(refreshToken)

    if (!tokens) {
      send(res, { success: false, status: 401, message: "Invalid or expired refresh token" })
      return
    }

    send(res, {
      success: true,
      status: 200,
      message: "Token refreshed",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: "Bearer",
        expiresIn: 15 * 60,
      },
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Revoke the current refresh token

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshBody

    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    send(res, { success: true, status: 200, message: "Logged out successfully" })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── POST /auth/logout-all ────────────────────────────────────────────────────
// Force-revoke ALL sessions for the current admin (requires valid access token)

export async function logoutAll(req: AuthRequest, res: Response): Promise<void> {
  try {
    await revokeAllRefreshTokens(req.admin!.id)

    send(res, {
      success: true,
      status: 200,
      message: "All sessions revoked",
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
// Returns the current admin profile (requires valid access token)

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, fullName: true, createdAt: true },
    })

    if (!admin) {
      send(res, { success: false, status: 404, message: "Admin not found" })
      return
    }

    send(res, {
      success: true,
      status: 200,
      message: "Data retrieved successfully",
      data: admin,
    })
  } catch (err) {
    catchError(res, err)
  }
}