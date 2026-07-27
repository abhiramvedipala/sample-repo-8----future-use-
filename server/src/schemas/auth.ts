// ---------------------------------------------------------------------------
// Zod schemas for auth request bodies.
//
// Why validate at all: TypeScript types are erased at build time — they
// guarantee nothing about what actually arrives in an HTTP request body,
// which is just untyped JSON from the network. `req.body` is really
// `unknown`, wearing a TypeScript type as a costume. Zod checks the ACTUAL
// data at runtime and only lets code past it treat that data as trustworthy.
//
// This is the first use of Zod in the project; step 5 reuses this exact
// pattern (parse, then throw AppError on failure) for every applications
// route.
// ---------------------------------------------------------------------------

import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  // 8 characters is a floor, not a real strength policy — enforcing actual
  // password strength is a bigger topic than this step needs.
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
