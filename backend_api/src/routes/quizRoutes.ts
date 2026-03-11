import { Router } from "express";

import * as quizController from "../controllers/quizController";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(quizController.listQuizzes));
router.get("/leaderboard", asyncHandler(quizController.leaderboard));
router.get("/:slug", asyncHandler(quizController.getQuiz));
router.post("/:id/attempts", authenticate, asyncHandler(quizController.recordAttempt));

export default router;
