import SibApiV3Sdk from "sib-api-v3-sdk";
import { env } from "../config/env";

type EmailInput = {
  email: string;
  subject: string;
  html: string;
};

const client = SibApiV3Sdk.ApiClient.instance;
if (env.brevoApiKey) {
  client.authentications["api-key"].apiKey = env.brevoApiKey;
}

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmail(input: EmailInput) {
  if (!env.brevoApiKey || !env.brevoFromEmail) {
    if (env.NODE_ENV === "production") {
      throw new Error("Brevo email configuration is incomplete. Set BREVO_API_KEY and BREVO_FROM_EMAIL.");
    }

    console.info("email_preview", {
      to: input.email,
      subject: input.subject,
      html: input.html,
    });
    return;
  }

  await emailApi.sendTransacEmail({
    sender: {
      email: env.brevoFromEmail,
      name: env.brevoFromName,
    },
    to: [
      {
        email: input.email,
      },
    ],
    subject: input.subject,
    htmlContent: input.html,
  });
}

export async function sendVerificationEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Verify your MANABU account",
    html: `
      <h2>Verify your MANABU account</h2>
      <p>Click the button below to verify your email.</p>
      <a href="${link}" style="padding:12px 18px;background:#22c55e;color:white;text-decoration:none;border-radius:10px;">
        Verify Email
      </a>
    `,
  });
}

export const sendEmailVerificationEmail = sendVerificationEmail;

export async function sendMagicLoginEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Login to MANABU",
    html: `
      <h2>Login to MANABU</h2>
      <a href="${link}" style="padding:12px 18px;background:#0ea5e9;color:white;text-decoration:none;border-radius:10px;">
        Login
      </a>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, link: string) {
  await sendEmail({
    email,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <a href="${link}" style="padding:12px 18px;background:#0ea5e9;color:white;text-decoration:none;border-radius:10px;">
        Reset Password
      </a>
    `,
  });
}
