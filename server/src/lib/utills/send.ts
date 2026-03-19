// src/utils/send.ts
import type { Response } from "express"
import type { ApiResponse } from "../types/auth.types"

export function send<T>(res: Response, payload: ApiResponse<T>): void {
  res.status(payload.status).json(payload)
}
