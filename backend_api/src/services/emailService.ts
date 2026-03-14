import { Resend } from "resend";

import { env } from "../config/env";

let resend: Resend | null = null;

function getResendClient() {
  if (!env.resendApiKey) return null;
  if (!resend) {
    resend = new Resend(env.resendApiKey);
  }
  return resend;
}

async function sendEmail(input: { email: string; subject: string; html: string }) {
  const client = getResendClient();

  if (!client) {
    console.info("email_preview", {
      to: input.email,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  await client.emails.send({
    from: `MANABU <${env.resendFromEmail}>`,
    to: input.email,
    subject: input.subject,
    html: input.html,
  });
}

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
