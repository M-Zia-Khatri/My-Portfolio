import type { Request, Response } from "express"
import { sendContactEmail } from "../lib/utills/mailer"
import { send } from "../lib/utills/send"
import { catchError } from "../lib/utills/catch-error"
import prisma from "@/lib/prisma"

// ─── SUBMIT CONTACT FORM (Public) ─────────────────────────────────────────────

export async function submitContact(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, message } = req.body

    const entry = await prisma.contactMessage.create({
      data: {
        full_name: fullName,
        email,
        message,
      },
    })

    // Fire-and-forget — don't block the response on email delivery
    sendContactEmail(fullName, email, message, entry.created_at).catch((err) =>
      console.error("[Mailer] Failed to send contact email:", err)
    )

    send(res, {
      success: true,
      status: 201,
      message: "Message sent successfully",
      data: { id: entry.id },
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── GET ALL MESSAGES (Admin only) ────────────────────────────────────────────

export async function getContacts(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(50, Number(req.query.pageSize) || 20)
    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.contactMessage.count(),
    ])

    send(res, {
      success: true,
      status: 200,
      message: "Data retrieved successfully",
      data: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    catchError(res, err)
  }
}

// ─── DELETE MESSAGE (Admin only) ──────────────────────────────────────────────

export async function deleteContact(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const existing = await prisma.contactMessage.findUnique({ where: { id } })

    if (!existing) {
      send(res, {
        success: false,
        status: 404,
        message: "Message not found",
      })
      return
    }

    await prisma.contactMessage.delete({ where: { id } })

    send(res, {
      success: true,
      status: 200,
      message: "Deleted successfully",
    })
  } catch (err) {
    catchError(res, err)
  }
}
