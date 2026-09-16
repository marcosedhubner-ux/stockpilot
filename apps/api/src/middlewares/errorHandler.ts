import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError } from "../domain/errors.js";
import { isProduction } from "../config/env.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(422).json({ error: "Validation failed", details: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: isProduction ? "Internal server error" : String(err) });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}
