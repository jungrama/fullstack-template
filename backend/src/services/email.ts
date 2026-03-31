import { readFileSync } from "node:fs"
import nodemailer from "nodemailer"

const templateDir = new URL("../email-template/", import.meta.url)

function loadTemplate(filename: string): string {
  return readFileSync(new URL(filename, templateDir), "utf-8")
}

function renderTemplate(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "")
}

function emailDefaults() {
  const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3092"
  const company =
    process.env.EMAIL_COMPANY_NAME ?? process.env.COMPANY_NAME ?? "App"
  const support =
    process.env.EMAIL_SUPPORT_URL ??
    (process.env.EMAIL_SUPPORT
      ? `mailto:${process.env.EMAIL_SUPPORT}`
      : "mailto:support@example.com")

  return {
    companyName: company,
    currentYear: String(new Date().getFullYear()),
    privacyLink: process.env.EMAIL_PRIVACY_URL ?? `${origin}/privacy`,
    termsLink: process.env.EMAIL_TERMS_URL ?? `${origin}/terms`,
    supportLink: support,
  }
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ??
    process.env.SMTP_USER ??
    '"App" <noreply@localhost>'
  )
}

function createTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS ?? "",
        }
      : undefined,
  })
}

async function sendHtmlEmail(options: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const transport = createTransport()
  if (!transport) {
    console.warn(
      "[email] SMTP_HOST not set; skipping email to",
      options.to,
      `(${options.subject})`,
    )
    return
  }

  await transport.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

export type SendForgotPasswordOtpParams = {
  to: string
  username: string
  otp: string
  companyName?: string
  supportLink?: string
  privacyLink?: string
  termsLink?: string
}

export async function sendForgotPasswordOtp(
  params: SendForgotPasswordOtpParams,
): Promise<void> {
  const defaults = emailDefaults()
  const html = renderTemplate(loadTemplate("forgot-password-otp.html"), {
    username: params.username,
    otp: params.otp,
    companyName: params.companyName ?? defaults.companyName,
    supportLink: params.supportLink ?? defaults.supportLink,
    privacyLink: params.privacyLink ?? defaults.privacyLink,
    termsLink: params.termsLink ?? defaults.termsLink,
    currentYear: defaults.currentYear,
  })

  await sendHtmlEmail({
    to: params.to,
    subject: "Reset your password",
    html,
  })
}

export type SendVerificationEmailMailParams = {
  to: string
  verificationUrl: string
  userName?: string
  headline?: string
  introMessage?: string
  ctaLabel?: string
  expiryNote?: string
  companyName?: string
  privacyLink?: string
  termsLink?: string
}

export async function sendVerificationEmailMail(
  params: SendVerificationEmailMailParams,
): Promise<void> {
  const defaults = emailDefaults()
  const username = params.userName?.trim() || "there"

  const html = renderTemplate(loadTemplate("verify-email-link.html"), {
    headline: params.headline ?? "Verify Your Email Address",
    username,
    introMessage:
      params.introMessage ??
      "Please verify your email address by clicking the button below.",
    verificationLink: params.verificationUrl,
    ctaLabel: params.ctaLabel ?? "Verify email",
    expiryNote:
      params.expiryNote ?? "This link may expire after a period of time.",
    companyName: params.companyName ?? defaults.companyName,
    currentYear: defaults.currentYear,
    privacyLink: params.privacyLink ?? defaults.privacyLink,
    termsLink: params.termsLink ?? defaults.termsLink,
  })

  await sendHtmlEmail({
    to: params.to,
    subject: "Verify your email address",
    html,
  })
}

export type SendResetPasswordEmailParams = {
  to: string
  resetUrl: string
  userName?: string
}

export async function sendResetPasswordEmail(
  params: SendResetPasswordEmailParams,
): Promise<void> {
  const html = renderTemplate(loadTemplate("verify-email-link.html"), {
    ...emailDefaults(),
    headline: "Reset Your Password",
    username: params.userName?.trim() || "there",
    introMessage:
      "We received a request to reset your password. Click the button below to continue.",
    verificationLink: params.resetUrl,
    ctaLabel: "Reset password",
    expiryNote: "This reset link will expire soon.",
  })

  await sendHtmlEmail({
    to: params.to,
    subject: "Reset your password",
    html,
  })
}
