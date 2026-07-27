// ---------------------------------------------------------------------------
// Turns a Zod schema into Express middleware.
//
// Pattern used by every route that accepts input: validate first, and only
// let the handler run with data that's already been checked. The handler
// never needs to check "is email actually a string?" or "is this a real
// status value?" — by the time it runs, that's already guaranteed.
// ---------------------------------------------------------------------------

import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "./errorHandler.js";

function formatIssue(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue
    ? `${firstIssue.path.join(".") || "value"}: ${firstIssue.message}`
    : "Invalid request";
}

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError(400, formatIssue(result.error)));
      return;
    }

    // Replace req.body with the PARSED output, not the raw input. Schemas
    // in this app trim whitespace, lowercase emails, and coerce date
    // strings to real Date objects — this is what makes those
    // transformations actually take effect for the rest of the request.
    req.body = result.data;
    next();
  };
}

// Same idea, for the URL's query string (?status=OA&sortBy=company). Query
// values always arrive as strings, so this is what turns
// "?sortBy=company" into a checked, typed { sortBy: "company" }.
//
// Stores the result on req.validatedQuery rather than overwriting req.query:
// Express defines `query` as a getter with no setter, and assigning to it
// throws under strict mode (which ESM always runs in) instead of silently
// doing nothing.
export function validateQuery<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(new AppError(400, formatIssue(result.error)));
      return;
    }

    req.validatedQuery = result.data;
    next();
  };
}
