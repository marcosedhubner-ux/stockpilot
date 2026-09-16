import { Router } from "express";
import { createPurchaseOrderSchema, receiveItemsSchema } from "./purchaseOrders.schema.js";
import * as purchaseOrdersService from "./purchaseOrders.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { UnauthorizedError } from "../../domain/errors.js";

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.use(authenticate);

purchaseOrdersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const purchaseOrders = await purchaseOrdersService.listPurchaseOrders();
    res.status(200).json({ purchaseOrders });
  })
);

purchaseOrdersRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = createPurchaseOrderSchema.parse(req.body);
    const purchaseOrder = await purchaseOrdersService.createPurchaseOrder(input);
    res.status(201).json({ purchaseOrder });
  })
);

purchaseOrdersRouter.post(
  "/:id/submit",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const purchaseOrder = await purchaseOrdersService.submitPurchaseOrder(id);
    res.status(200).json({ purchaseOrder });
  })
);

purchaseOrdersRouter.post(
  "/:id/receive",
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    const input = receiveItemsSchema.parse(req.body);
    const purchaseOrder = await purchaseOrdersService.receiveItems(id, input, req.auth.staffId);
    res.status(200).json({ purchaseOrder });
  })
);
