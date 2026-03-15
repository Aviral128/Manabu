import nodemailer from "nodemailer";

import { env } from "../config/env";

type EmailInput = {
  email: string;
  subject: string;
  html: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    if (env.NODE_ENV === "production") {
      throw new Error("SMTP configuration is incomplete. Set SMTP_USER, SMTP_PASS, and SMTP_FROM.");
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: true,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return transporter;
}

async function sendEmail(input: EmailInput) {
  const client = getTransporter();

  if (!client) {
    console.info("email_preview", {
      to: input.email,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  await client.sendMail({
    from: env.smtpFrom,
    to: input.email,
    subject: input.subject,
    html: input.html,
  });
}

export async function sendVerificationEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Verify your MANABU account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #101828;">
        <h2>Verify your MANABU account</h2>
        <p>Confirm your email address to activate your account and unlock login.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#22c55e;color:#042012;text-decoration:none;font-weight:700;">Verify email</a></p>
        <p>This link expires in ${env.magicLinkExpiryMinutes} minutes.</p>
      </div>
    `,
  });
}

export const sendEmailVerificationEmail = sendVerificationEmail;

export async function sendMagicLoginEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Login to MANABU",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #101828;">
        <h2>Login to MANABU</h2>
        <p>Click the link below to login.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0ea5e9;color:#001018;text-decoration:none;font-weight:700;">Login</a></p>
        <p>This link expires in ${env.magicLinkExpiryMinutes} minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Reset your MANABU password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #101828;">
        <h2>Reset your MANABU password</h2>
        <p>Click the link below to choose a new password.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0ea5e9;color:#001018;text-decoration:none;font-weight:700;">Reset password</a></p>
        <p>This link expires in ${env.magicLinkExpiryMinutes} minutes.</p>
      </div>
    `,
  });
}
