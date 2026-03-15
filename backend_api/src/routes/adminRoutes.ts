import { Router } from "express";

import * as adminController from "../controllers/adminController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin, requireManagerOrAdmin } from "../middleware/requireAdmin";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/summary", requireManagerOrAdmin, asyncHandler(adminController.summaryController));
router.get("/users", requireManagerOrAdmin, asyncHandler(adminController.listUsersController));
router.patch("/users/:id", requireManagerOrAdmin, asyncHandler(adminController.updateUserController));
router.delete("/users/:id", requireAdmin, asyncHandler(adminController.deleteUserController));
router.get("/quizzes", requireAdmin, asyncHandler(adminController.listQuizzesController));
router.post("/quizzes", requireAdmin, asyncHandler(adminController.createQuizController));
router.put("/quizzes/:id", requireAdmin, asyncHandler(adminController.updateQuizController));
router.delete("/quizzes/:id", requireAdmin, asyncHandler(adminController.deleteQuizController));
router.get("/logs", requireAdmin, asyncHandler(adminController.logsController));

export default router;
