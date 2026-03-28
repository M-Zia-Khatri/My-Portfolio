import prisma from '@/lib/prisma';
import { CreatePortfolioDto, UpdatePortfolioDto } from '@/lib/types/portfolio.types';
import {
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
  generateETag,
  TTL,
} from '@/lib/utills/caching';
import type { Request, Response } from 'express';
import { catchError } from '../lib/utills/catch-error';
import { send } from '../lib/utills/send';

const CACHE_KEYS = {
  all: 'portfolio:list',
  one: (id: string) => `portfolio:${id}`,
  prefix: 'portfolio',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function parseItem(item: Record<string, unknown>) {
  return {
    ...item,
    useTech: JSON.parse(item.use_tech as string),
  };
}

function validateCreate(body: Partial<CreatePortfolioDto>): string | null {
  const { siteName, siteRole, siteUrl, siteImageUrl, useTech, description } = body;

  if (!siteName?.trim()) return 'siteName is required';
  if (!siteRole?.trim()) return 'siteRole is required';
  if (!siteUrl?.trim()) return 'siteUrl is required';
  if (!isValidUrl(siteUrl)) return 'siteUrl must be a valid URL';
  if (!siteImageUrl?.trim()) return 'siteImageUrl is required';
  if (!isValidUrl(siteImageUrl)) return 'siteImageUrl must be a valid URL';
  if (!description?.trim()) return 'description is required';
  if (!Array.isArray(useTech) || useTech.length === 0) return 'useTech must be a non-empty array';
  if (useTech.some((t) => typeof t !== 'string' || !t.trim()))
    return 'useTech must contain non-empty strings';

  return null;
}

function validateUpdate(body: UpdatePortfolioDto): string | null {
  const { siteUrl, siteImageUrl, useTech } = body;

  if (siteUrl !== undefined) {
    if (!siteUrl.trim()) return 'siteUrl must not be empty';
    if (!isValidUrl(siteUrl)) return 'siteUrl must be a valid URL';
  }

  if (siteImageUrl !== undefined) {
    if (!siteImageUrl.trim()) return 'siteImageUrl must not be empty';
    if (!isValidUrl(siteImageUrl)) return 'siteImageUrl must be a valid URL';
  }

  if (useTech !== undefined) {
    if (!Array.isArray(useTech) || useTech.length === 0) return 'useTech must be a non-empty array';
    if (useTech.some((t) => typeof t !== 'string' || !t.trim()))
      return 'useTech must contain non-empty strings';
  }

  return null;
}

// ─── GET /api/portfolio ──────────────────────────────────────────────────────

export async function getAllPortfolioItems(req: Request, res: Response): Promise<void> {
  try {
    const clientETag = req.headers['if-none-match'] as string | undefined;

    const result = await cacheRememberConditional(CACHE_KEYS.all, {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: () =>
        prisma.portfolio_item.findMany({
          orderBy: { created_at: 'desc' },
        }),
    });

    res.setHeader('ETag', result.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    if (result.status === 304) {
      return send(res, { success: true, status: 304, message: 'Data not modified' });
    }

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio items retrieved successfully',
      data: result.data?.map(parseItem),
      meta: { total: result.data?.length },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── GET /api/portfolio/:id ──────────────────────────────────────────────────

export async function getPortfolioItemById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const clientETag = req.headers['if-none-match'] as string | undefined;

    const result = await cacheRememberConditional(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      ifNoneMatch: clientETag,
      callback: () => prisma.portfolio_item.findUnique({ where: { id } }),
    });

    res.setHeader('ETag', result.etag);
    res.setHeader('Cache-Control', 'private, must-revalidate');

    if (result.status === 304) {
      return send(res, { success: true, status: 304, message: 'Data not modified' });
    }

    if (!result.data) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item retrieved successfully',
      data: parseItem(result.data),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /api/portfolio ─────────────────────────────────────────────────────

export async function createPortfolioItem(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Partial<CreatePortfolioDto>;

    const validationError = validateCreate(body);
    if (validationError) {
      send(res, {
        success: false,
        status: 400,
        message: 'Validation error',
        error: { detail: validationError },
      });
      return;
    }

    const { siteName, siteRole, siteUrl, siteImageUrl, useTech, description } =
      body as CreatePortfolioDto;

    const newItem = await prisma.portfolio_item.create({
      data: {
        site_name: siteName,
        site_role: siteRole,
        site_url: siteUrl,
        site_image_url: siteImageUrl,
        use_tech: JSON.stringify(useTech),
        description,
      },
    });

    // Warm the single item cache (instant consistency for GET /:id)
    await cachePut(CACHE_KEYS.one(newItem.id), newItem, TTL.ONE_DAY);
    // Only invalidate the list
    await cacheInvalidatePrefix(CACHE_KEYS.prefix);

    res.setHeader('ETag', generateETag(newItem));
    send(res, {
      success: true,
      status: 201,
      message: 'Portfolio item created successfully',
      data: parseItem(newItem),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── PATCH /api/portfolio/:id ────────────────────────────────────────────────

export async function updatePortfolioItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as UpdatePortfolioDto;
    const clientETag = req.headers['if-match'] as string | undefined;

    if (!clientETag) {
      return send(res, {
        success: false,
        status: 428,
        message: 'If-Match header required for optimistic locking',
      });
    }

    // Check existence + optimistic locking via cache
    const cached = await cacheRememberConditional(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      ifMatch: clientETag, // 412 if modified
      callback: () => prisma.portfolio_item.findUnique({ where: { id } }),
    });

    if (cached.status === 412) {
      return send(res, {
        success: false,
        status: 412,
        message: 'Resource modified by another request',
        error: { currentETag: cached.etag },
      });
    }

    if (!cached.data) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    const validationError = validateUpdate(body);
    if (validationError) {
      send(res, {
        success: false,
        status: 400,
        message: 'Validation error',
        error: { detail: validationError },
      });
      return;
    }

    const { siteName, siteRole, siteUrl, siteImageUrl, useTech, description } = body;

    const updatedItem = await prisma.portfolio_item.update({
      where: { id },
      data: {
        ...(siteName !== undefined && { site_name: siteName }),
        ...(siteRole !== undefined && { site_role: siteRole }),
        ...(siteUrl !== undefined && { site_url: siteUrl }),
        ...(siteImageUrl !== undefined && { site_image_url: siteImageUrl }),
        ...(useTech !== undefined && { use_tech: JSON.stringify(useTech) }),
        ...(description !== undefined && { description }),
      },
    });
    // Warm cache with new value, invalidate list
    await Promise.all([
      cachePut(CACHE_KEYS.one(id), updatedItem, TTL.ONE_DAY),
      cacheInvalidatePrefix(CACHE_KEYS.prefix),
    ]);

    res.setHeader('ETag', generateETag(updatedItem));
    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item updated successfully',
      data: parseItem(updatedItem),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── DELETE /api/portfolio/:id ───────────────────────────────────────────────

export async function deletePortfolioItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Fast existence check via cache
    const cached = await cacheRemember(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      callback: () =>
        prisma.portfolio_item.findUnique({
          where: { id },
          select: { id: true },
        }),
    });

    if (!cached) {
      return send(res, {
        success: false,
        status: 404,
        message: 'Portfolio item not found',
        error: { detail: `No item with id "${id}"` },
      });
    }

    await prisma.portfolio_item.delete({ where: { id } });

    await Promise.all([cacheForget(CACHE_KEYS.one(id)), cacheInvalidatePrefix(CACHE_KEYS.prefix)]);

    send(res, {
      success: true,
      status: 200,
      message: 'Portfolio item deleted successfully',
    });
  } catch (err) {
    catchError(res, err);
  }
}
