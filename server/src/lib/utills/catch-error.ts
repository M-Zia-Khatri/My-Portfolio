import type { Response } from 'express';
import { send } from './send';

export function catchError(res: Response, err: unknown): void {
  console.error('[Server]', err);

  send(res, {
    success: false,
    status: 500,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV !== 'production'
        ? err instanceof Error
          ? { name: err.name, detail: err.message }
          : { detail: String(err) }
        : undefined,
  });
}
