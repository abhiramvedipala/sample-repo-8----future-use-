// ---------------------------------------------------------------------------
// Centralized error handling.
//
// Every route in this app can fail in an "expected" way (bad input, no
// permission, not found) or an "unexpected" way (a bug, the database is
// down). Both need to end in a sensible JSON response — the client should
// never receive an HTML crash page or a hung connection.
//
// The pattern: routes throw `AppError` for expected failures and let
// anything else (a genuine bug) propagate as a plain Error. ONE handler at
// the bottom of the middleware chain turns both into JSON.
// ---------------------------------------------------------------------------

import type { NextFunction, Request, Response } from "express";
import { isProduction } from "../lib/env.js";

// A known, expected failure — the kind of thing a route decides on purpose,
// e.g. "that email is already registered" (409) or "not logged in" (401).
// It carries an HTTP status code with it so the handler below knows what to
// send back.
export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

// Runs when a request matches no route at all. Registered in app.ts AFTER
// every real route, so it only fires when nothing else handled the request.
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `No route: ${req.method} ${req.path}`));
}

// The error handler. Express recognizes this as error-handling middleware
// specifically because it takes 4 arguments (err, req, res, next) — that
// exact arity is how Express tells it apart from a normal route handler.
// It must be registered LAST, after every route and after notFoundHandler.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  // AppError messages are written by us on purpose to be shown to the user
  // ("Email already registered"). A generic Error might be a raw database
  // or driver message — showing that to a client can leak internal details
  // (table names, file paths), so in production it's replaced with a flat
  // "Internal server error". In development the real message is shown so
  // you can actually debug it.
  const message = isAppError || !isProduction
    ? (err instanceof Error ? err.message : String(err))
    : "Internal server error";

  // Anything that reaches here and isn't an AppError is, by definition, a
  // bug or an infrastructure failure (e.g. the database connection dropped).
  // Log it on the server regardless of what we send the client.
  if (!isAppError) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    error: {
      message,
      // Stack traces are extremely useful for debugging and extremely
      // useful for an attacker (file paths, dependency versions) — so they
      // are only ever sent outside of production.
      ...(isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
    },
  });
}
