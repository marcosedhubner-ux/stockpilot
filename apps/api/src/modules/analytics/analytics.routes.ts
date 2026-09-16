import { Router } from "express";
import { getInventorySummary } from "./analytics.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get(
  "/inventory-summary",
  asyncHandler(async (_req, res) => {
    const summary = await getInventorySummary();
    res.status(200).json(summary);
  })
);
