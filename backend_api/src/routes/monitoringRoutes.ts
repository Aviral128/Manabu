import { Router } from "express";

import * as monitoringController from "../controllers/monitoringController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/events", asyncHandler(monitoringController.ingestEvent));

export default router;
