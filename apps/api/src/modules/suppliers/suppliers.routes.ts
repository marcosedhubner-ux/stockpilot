import { Router } from "express";
import { createSupplierSchema } from "./suppliers.schema.js";
import * as suppliersService from "./suppliers.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";

export const suppliersRouter = Router();

suppliersRouter.use(authenticate);

suppliersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const suppliers = await suppliersService.listSuppliers();
    res.status(200).json({ suppliers });
  })
);

suppliersRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createSupplierSchema.parse(req.body);
    const supplier = await suppliersService.createSupplier(input);
    res.status(201).json({ supplier });
  })
);
