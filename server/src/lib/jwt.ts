// ---------------------------------------------------------------------------
// Signing and verifying login sessions.
//
// A JWT (JSON Web Token) is a string with three parts: header.payload.signature.
// The payload is just base64 — readable by anyone, NOT encrypted — but the
// signature is a cryptographic hash of the payload made with JWT_SECRET. Change
// one character of the payload and the signature no longer matches, so a
// forged or tampered token is instantly detectable. That's the entire trust
// model: the payload is public, only the SIGNATURE is what can't be faked
// without knowing the secret.
//
// This means: never put a password or anything truly secret inside the
// payload. Ours holds only a user id.
// ---------------------------------------------------------------------------

import jwt from "jsonwebtoken";
import { env } from "./env.js";

// How long a login lasts before the browser has to log in again.
const TOKEN_TTL = "7d";

export interface SessionPayload {
  userId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

// Throws if the token is missing a valid signature, is malformed, or has
// expired. Callers (requireAuth) turn that throw into a 401, never a 500 —
// an invalid session is an expected situation, not a server bug.
export function verifySessionToken(token: string): SessionPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === "string" || typeof decoded["userId"] !== "string") {
    throw new Error("Malformed session token payload");
  }
  return { userId: decoded["userId"] };
}
