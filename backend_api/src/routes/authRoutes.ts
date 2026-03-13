import rateLimit from "express-rate-limit";
import { Router } from "express";

import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

function rateLimitKey(request: { ip?: string; body?: { email?: unknown } }) {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "anon";
  return `${request.ip ?? "unknown"}:${email}`;
}

const otpIssueLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: (_request, response) => {
    response.status(429).json({
      code: "OTP_RATE_LIMITED",
      message: "Too many OTP requests. Please wait before trying again.",
    });
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: (_request, response) => {
    response.status(429).json({
      code: "OTP_ATTEMPTS_LIMITED",
      message: "Too many OTP verification attempts. Please wait before trying again.",
    });
  },
});

router.post("/signup", otpIssueLimiter, asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.post("/send-verification-otp", otpIssueLimiter, asyncHandler(authController.sendVerificationOtp));
router.post("/verify-email", otpVerifyLimiter, asyncHandler(authController.verifyEmail));
router.post("/forgot-password", otpIssueLimiter, asyncHandler(authController.forgotPassword));
router.post("/reset-password", otpVerifyLimiter, asyncHandler(authController.resetPassword));
router.get("/me", authenticate, asyncHandler(authController.me));
router.patch("/me", authenticate, asyncHandler(authController.updateMe));

export default router;
