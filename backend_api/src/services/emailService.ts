import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmail(input: {
  email: string;
  otp: string;
  subject: string;
  heading: string;
  intro: string;
}) {
  const expiresInMinutes = env.otpExpiryMinutes;

  await resend.emails.send({
    from: "MANABU <onboarding@resend.dev>",
    to: input.email,
    subject: input.subject,
    html: `
      <div style="font-family: Arial; line-height:1.6;">
        <h2>${input.heading}</h2>
        <p>${input.intro}</p>
        <h1 style="letter-spacing:6px;">${input.otp}</h1>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
      </div>
    `,
  });
}

export async function sendVerificationOTP(email: string, otp: string) {
  await sendOTPEmail({
    email,
    otp,
    subject: "Verify your MANABU account",
    heading: "Verify your email",
    intro: "Use the following OTP to activate your MANABU account.",
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  await sendOTPEmail({
    email,
    otp,
    subject: "Reset your MANABU password",
    heading: "Password reset request",
    intro: "Use the following OTP to reset your password.",
  });
}