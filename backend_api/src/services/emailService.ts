import nodemailer from "nodemailer";

import { env } from "../config/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.smtp.enabled) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

function fromAddress() {
  const email = env.smtp.enabled ? env.smtp.fromEmail : "no-reply@manabu.local";
  return `"${env.smtp.fromName}" <${email}>`;
}

async function sendOTPEmail(input: {
  email: string;
  otp: string;
  subject: string;
  heading: string;
  intro: string;
}) {
  const mailer = getTransporter();
  const expiresInMinutes = env.otpExpiryMinutes;

  const info = await mailer.sendMail({
    from: fromAddress(),
    to: input.email,
    subject: input.subject,
    text: `${input.intro}\n\nOTP: ${input.otp}\nThis code expires in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 12px;">${input.heading}</h2>
        <p>${input.intro}</p>
        <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 24px 0;">${input.otp}</p>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (!env.smtp.enabled) {
    console.info("email_preview", {
      to: input.email,
      subject: input.subject,
      messageId: info.messageId,
    });
  }
}

export async function sendVerificationOTP(email: string, otp: string) {
  await sendOTPEmail({
    email,
    otp,
    subject: "Verify your MANABU account",
    heading: "Verify your email",
    intro: "Use the following one-time password to activate your MANABU account.",
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  await sendOTPEmail({
    email,
    otp,
    subject: "Reset your MANABU password",
    heading: "Password reset request",
    intro: "Use the following one-time password to reset your MANABU password.",
  });
}
