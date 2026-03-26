// ─── REQUEST BODIES ───────────────────────────────────────────────────────────

export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyOtpBody {
  email: string;
  otp: string;
}

export interface RefreshBody {
  refreshToken: string;
}

// ─── JWT PAYLOAD ─────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string; // adminId
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string; // adminId
  jti: string; // RefreshToken.id (used for revocation lookppppppppppppppppppppppppppup)
  type: 'refresh';
}

// ─── EXTENDED REQUEST ────────────────────────────────────────────────────────

import type { Request } from 'express';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}
