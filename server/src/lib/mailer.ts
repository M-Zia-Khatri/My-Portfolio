import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ─── VERIFY CONNECTION ON STARTUP ────────────────────────────────────────────

export async function verifyMailer(): Promise<void> {
  await transporter.verify()
  console.log("✓ Mailer connected")
}

// ─── SEND OTP EMAIL ──────────────────────────────────────────────────────────

export async function sendOtpEmail(
  toEmail: string,
  fullName: string,
  otpCode: string
): Promise<void> {
  await transporter.sendMail({
    from: `"Admin Portal" <${process.env.SMTP_FROM}>`,
    to:   toEmail,
    subject: "Your Admin Login OTP",
    text: `Hi ${fullName},\n\nYour one-time password is: ${otpCode}\n\nIt expires in 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Admin Portal</h2>
        <p>Hi <strong>${fullName}</strong>,</p>
        <p>Your one-time password is:</p>
        <div style="font-size:2rem;font-weight:700;letter-spacing:.3em;padding:16px 24px;background:#f0f4ff;border-radius:8px;display:inline-block">
          ${otpCode}
        </div>
        <p style="color:#888;font-size:.875rem;margin-top:16px">
          Expires in <strong>5 minutes</strong>. Do not share this with anyone.
        </p>
      </div>
    `,
  })
}
