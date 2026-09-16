import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../domain/errors.js";
import type { AuthTokenPayload } from "../modules/auth/auth.service.js";

export function requireRole(...roles: AuthTokenPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new UnauthorizedError());
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new ForbiddenError());
      return;
    }

    next();
  };
}
