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

const authRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: (_request, response) => {
    response.status(429).json({
      code: "AUTH_RATE_LIMITED",
      message: "Too many authentication requests. Please wait before trying again.",
    });
  },
});

const tokenVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: (_request, response) => {
    response.status(429).json({
      code: "TOKEN_ATTEMPTS_LIMITED",
      message: "Too many token verification attempts. Please wait before trying again.",
    });
  },
});

router.post("/signup", authRequestLimiter, asyncHandler(authController.signup));
router.post("/login", authRequestLimiter, asyncHandler(authController.login));
router.post("/magic-login", authRequestLimiter, asyncHandler(authController.magicLogin));
router.get("/verify-magic", tokenVerifyLimiter, asyncHandler(authController.verifyMagic));
router.post("/forgot-password", authRequestLimiter, asyncHandler(authController.forgotPassword));
router.post("/reset-password", authRequestLimiter, asyncHandler(authController.resetPassword));
router.get("/me", authenticate, asyncHandler(authController.me));
router.patch("/me", authenticate, asyncHandler(authController.updateMe));

export default router;
