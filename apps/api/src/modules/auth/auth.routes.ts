import { Router } from "express";
import { loginSchema, registerStaffSchema } from "./auth.schema.js";
import { getStaffById, login, registerStaff } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { authRateLimiter } from "../../middlewares/rateLimiters.js";
import { isProduction } from "../../config/env.js";
import { UnauthorizedError } from "../../domain/errors.js";

export const authRouter = Router();

const SESSION_COOKIE = "stockpilot_token";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

authRouter.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const { token, staff } = await login(input);

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.status(200).json({ staff });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).send();
});

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.auth) throw new UnauthorizedError();
    const staff = await getStaffById(req.auth.staffId);
    res.status(200).json({ staff });
  })
);

authRouter.post(
  "/register",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = registerStaffSchema.parse(req.body);
    const staff = await registerStaff(input);
    res.status(201).json({ staff });
  })
);
