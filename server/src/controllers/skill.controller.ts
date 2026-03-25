import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma, SkillMode } from "generated/prisma/client";
import {
  createSkillSchema,
  updateSkillSchema,
} from "@/lib/validators/skill.validation";
import { send } from "@/lib/utills/send";
import { SkillRow, toSkillResponse } from "@/lib/types/skill.types";
import { catchError } from "@/lib/utills/catch-error";
import {
  cacheForget,
  cacheInvalidatePrefix,
  cacheRemember,
  TTL,
} from "@/lib/utills/caching";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Prisma requires Prisma.JsonNull (not plain null) to explicitly store NULL
// in a nullable Json column.
function toJson(
  value: unknown[] | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value != null ? (value as Prisma.InputJsonValue) : Prisma.JsonNull;
}

function isLangTaken(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray((err.meta as { target?: string[] })?.target) &&
    (err.meta as { target: string[] }).target.includes("lang")
  );
}

type CustomSkillWhereInput = Prisma.SkillWhereInput & {
  mode?: Prisma.EnumSkillModeFilter<"Skill"> | SkillMode | undefined;
};

const CACHE_KEYS = {
  all: (mode?: string) => `skills:list:${mode ?? "all"}`,
  one: (id: string) => `skills:${id}`,
  prefix: "skills",
};

// ─── GET /api/skills ──────────────────────────────────────────────────────────
// ─── GET /api/skills?mode=code ───────────────────────────────────────────────
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { mode } = req.query;
    const modeStr = typeof mode === "string" ? mode : undefined;

    const rows = await cacheRemember(CACHE_KEYS.all(modeStr), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      callback: () =>
        prisma.skill.findMany({
          where:
            modeStr === "code" || modeStr === "terminal"
              ? { mode: modeStr as SkillMode }
              : undefined,
          orderBy: { created_at: "asc" },
        }),
    });

    send(res, {
      success: true,
      status: 200,
      message: "Skills retrieved successfully",
      data: (rows as unknown as SkillRow[]).map(toSkillResponse),
      meta: { total: rows.length },
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── GET /api/skills/:id ──────────────────────────────────────────────────────
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const row = await cacheRemember(CACHE_KEYS.one(id), {
      ttl: TTL.ONE_DAY,
      staleTtl: TTL.ONE_WEEK,
      callback: () => prisma.skill.findUnique({ where: { id } }),
    });

    if (!row) {
      send(res, {
        success: false,
        status: 404,
        message: "Skill not found",
      });
      return;
    }

    send(res, {
      success: true,
      status: 200,
      message: "Skill retrieved successfully",
      data: toSkillResponse(row as unknown as SkillRow),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── POST /api/skills ─────────────────────────────────────────────────────────
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createSkillSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: {
          field: firstIssue.path.join(".") || "body",
          detail: firstIssue.message,
          issues: parsed.error.issues,
        },
      });
      return;
    }

    const input = parsed.data;

    const row = await prisma.skill.create({
      data: {
        name: input.name,
        icon: input.icon,
        file_name: input.fileName,
        lang: input.lang,
        color: input.color,
        mode: input.mode,
        code: toJson(input.mode === "code" ? input.code : null),
        commands: toJson(input.mode === "terminal" ? input.commands : null),
      },
    });

    await cacheInvalidatePrefix(CACHE_KEYS.prefix);

    send(res, {
      success: true,
      status: 201,
      message: "Skill created successfully",
      data: toSkillResponse(row as unknown as SkillRow),
    });
  } catch (err) {
    if (isLangTaken(err)) {
      send(res, {
        success: false,
        status: 409,
        message: "A skill with this language already exists",
        error: { field: "lang", detail: "lang must be unique" },
      });
      return;
    }
    catchError(res, err);
  }
}

// ─── PATCH /api/skills/:id ────────────────────────────────────────────────────
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      send(res, {
        success: false,
        status: 404,
        message: "Skill not found",
      });
      return;
    }

    const parsed = updateSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      send(res, {
        success: false,
        status: 400,
        message: "Validation error",
        error: {
          field: firstIssue.path.join(".") || "body",
          detail: firstIssue.message,
          issues: parsed.error.issues,
        },
      });
      return;
    }

    const input = parsed.data;
    const resolvedMode = input.mode ?? (existing.mode as "code" | "terminal");

    // Merge incoming value with stored value; null out if mode switched.
    const resolvedCode =
      resolvedMode === "code"
        ? input.code !== undefined
          ? input.code
          : (existing.code as string[] | null)
        : null;

    const resolvedCommands =
      resolvedMode === "terminal"
        ? input.commands !== undefined
          ? input.commands
          : (existing.commands as unknown[] | null)
        : null;

    const row = await prisma.skill.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.fileName !== undefined && { file_name: input.fileName }),
        ...(input.lang !== undefined && { lang: input.lang }),
        ...(input.color !== undefined && { color: input.color }),
        mode: resolvedMode,
        code: toJson(resolvedCode),
        commands: toJson(resolvedCommands),
      },
    });

    await Promise.all([
      cacheForget(CACHE_KEYS.one(id)),
      cacheInvalidatePrefix(CACHE_KEYS.prefix),
    ]);

    send(res, {
      success: true,
      status: 200,
      message: "Skill updated successfully",
      data: toSkillResponse(row as unknown as SkillRow),
    });
  } catch (err) {
    catchError(res, err);
  }
}

// ─── DELETE /api/skills/:id ───────────────────────────────────────────────────
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      send(res, {
        success: false,
        status: 404,
        message: "Skill not found",
      });
      return;
    }

    await prisma.skill.delete({ where: { id } });

    await Promise.all([
      cacheForget(CACHE_KEYS.one(id)),
      cacheInvalidatePrefix(CACHE_KEYS.prefix),
    ]);

    send(res, {
      success: true,
      status: 200,
      message: "Skill deleted successfully",
    });
  } catch (err) {
    catchError(res, err);
  }
}
