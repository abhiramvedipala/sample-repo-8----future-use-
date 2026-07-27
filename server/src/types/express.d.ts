// ---------------------------------------------------------------------------
// Adds app-specific fields to Express's Request type.
//
// requireAuth.ts sets `req.userId`, validateQuery sets `req.validatedQuery`.
// Without this file, TypeScript would reject both assignments — Express's
// own Request type has no idea our app adds these fields. "Module
// augmentation" (the `declare global` block below) is the standard way to
// extend a library's types from application code without forking the
// library itself.
// ---------------------------------------------------------------------------

import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;

      // Why this exists instead of just overwriting req.query: Express
      // defines `query` as a getter-only property with no setter. Under
      // ESM (which this project uses everywhere — see tsconfig's
      // "module": "NodeNext"), all code runs in strict mode, and strict
      // mode turns "assign to a getter-only property" into a thrown
      // TypeError instead of a silent no-op. validateQuery therefore
      // stores its parsed, defaulted result here instead of fighting
      // Express's own property.
      validatedQuery?: unknown;
    }
  }
}
