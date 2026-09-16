import { Router } from "express";
import { createProductSchema, recordMovementSchema } from "./products.schema.js";
import * as productsService from "./products.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { ForbiddenError, UnauthorizedError } from "../../domain/errors.js";

export const productsRouter = Router();

productsRouter.use(authenticate);

productsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const products = await productsService.listProducts();
    res.status(200).json({ products });
  })
);

productsRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(input);
    res.status(201).json({ product });
  })
);

productsRouter.get(
  "/:id/movements",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const movements = await productsService.listMovements(id);
    res.status(200).json({ movements });
  })
);

productsRouter.post(
  "/:id/movements",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    const input = recordMovementSchema.parse(req.body);

    if (input.type === "ADJUSTED" && req.auth.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can record manual stock adjustments");
    }

    const movement = await productsService.recordMovement(id, input, req.auth.staffId);
    res.status(201).json({ movement });
  })
);
