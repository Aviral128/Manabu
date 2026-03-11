import { Router } from "express";

import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));
router.patch("/me", authenticate, asyncHandler(authController.updateMe));

export default router;
