// ---------------------------------------------------------------------------
// Adds a `userId` field to Express's Request type.
//
// requireAuth.ts sets `req.userId` after verifying the session cookie.
// Without this file, TypeScript would reject that assignment — Express's
// own Request type has no idea our app adds this field. "Module
// augmentation" (the `declare global` block below) is the standard way to
// extend a library's types from application code without forking the
// library itself.
// ---------------------------------------------------------------------------

import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
