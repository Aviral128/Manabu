import { Router } from "express";

import * as adminController from "../controllers/adminController";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/summary", asyncHandler(adminController.summaryController));
router.get("/users", asyncHandler(adminController.listUsersController));
router.patch("/users/:id", asyncHandler(adminController.updateUserController));
router.delete("/users/:id", asyncHandler(adminController.deleteUserController));
router.get("/quizzes", asyncHandler(adminController.listQuizzesController));
router.post("/quizzes", asyncHandler(adminController.createQuizController));
router.put("/quizzes/:id", asyncHandler(adminController.updateQuizController));
router.delete("/quizzes/:id", asyncHandler(adminController.deleteQuizController));
router.get("/logs", asyncHandler(adminController.logsController));

export default router;
