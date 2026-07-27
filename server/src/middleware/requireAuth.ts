// ---------------------------------------------------------------------------
// Route protection: blocks a request unless it carries a valid session.
//
// Any route that should only work for a logged-in user adds this middleware
// in front of it, e.g. `router.get("/me", requireAuth, handler)`. Express
// runs middleware in order, so this one runs BEFORE the route handler and
// can stop the request from ever reaching it.
// ---------------------------------------------------------------------------

import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../lib/cookies.js";
import { verifySessionToken } from "../lib/jwt.js";
import { AppError } from "./errorHandler.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies[AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    next(new AppError(401, "Not authenticated"));
    return;
  }

  try {
    const { userId } = verifySessionToken(token);
    req.userId = userId;
    next();
  } catch {
    // Deliberately one generic message for every failure mode (missing,
    // expired, tampered, wrong secret). Distinguishing them for the client
    // gives an attacker a signal about WHY their forged token failed,
    // without giving the real user any extra information they can act on.
    next(new AppError(401, "Not authenticated"));
  }
}
