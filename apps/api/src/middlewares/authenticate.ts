import type { NextFunction, Request, Response } from "express";
import { verifyToken, type AuthTokenPayload } from "../modules/auth/auth.service.js";
import { UnauthorizedError } from "../domain/errors.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.stockpilot_token as string | undefined;

  if (!token) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired session"));
  }
}
