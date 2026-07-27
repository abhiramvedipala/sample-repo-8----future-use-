// ---------------------------------------------------------------------------
// Turns a Zod schema into Express middleware.
//
// Pattern used by every route that accepts a body: validate first, and only
// let the handler run with data that's already been checked. The handler
// below never needs to check "is email actually a string?" — by the time it
// runs, that's already guaranteed.
// ---------------------------------------------------------------------------

import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "./errorHandler.js";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join(".") || "body"}: ${firstIssue.message}`
        : "Invalid request body";
      next(new AppError(400, message));
      return;
    }

    // Replace req.body with the PARSED output, not the raw input. Zod
    // schemas here trim whitespace and lowercase email — this is what makes
    // that transformation actually take effect for the rest of the request.
    req.body = result.data;
    next();
  };
}
