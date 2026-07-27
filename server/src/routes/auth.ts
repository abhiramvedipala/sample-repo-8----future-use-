// ---------------------------------------------------------------------------
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// GET  /api/auth/me       (session check)
// ---------------------------------------------------------------------------

import bcrypt from "bcrypt";
import { Router } from "express";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { clearAuthCookie, setAuthCookie } from "../lib/cookies.js";
import { signSessionToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";

export const authRouter = Router();

// Cost factor for bcrypt: each increment roughly DOUBLES the time it takes
// to hash (and to check) one password. 12 is a current, reasonable default —
// slow enough that brute-forcing a stolen hash is impractical, fast enough
// that a real login doesn't feel slow.
const BCRYPT_ROUNDS = 12;

// A precomputed hash of a password nobody will ever type, used below to keep
// login's response time the same whether the email exists or not. See the
// comment at its use site for why this matters.
const DUMMY_HASH_FOR_TIMING_SAFETY = bcrypt.hashSync(
  "no-such-user-timing-safety-placeholder",
  BCRYPT_ROUNDS,
);

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  // bcrypt.hash does two things: generates a random "salt" (so two users
  // with the same password get completely different hashes) and mixes the
  // password into that salt through many rounds of hashing. The output
  // string ENCODES the salt and cost factor alongside the hash, so
  // bcrypt.compare later can redo the same work without us storing anything
  // extra.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const token = signSessionToken({ userId: user.id });
    setAuthCookie(res, token);

    // Never echo passwordHash back, even though it's already hashed — it's
    // simply not something the client has any use for.
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    // P2002 is Prisma's code for "unique constraint violated" — here, the
    // `email @unique` in schema.prisma. Relying on the DATABASE to catch
    // this (rather than a "does this email exist?" query beforehand) closes
    // a race condition: two registrations for the same email arriving at
    // the exact same instant would both pass a pre-check, but the database
    // itself can only ever accept one.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "Email already registered");
    }
    throw error;
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });

  // bcrypt.compare always runs, even when no user was found — comparing
  // against DUMMY_HASH_FOR_TIMING_SAFETY instead of skipping the check.
  // bcrypt is deliberately slow, so "unknown email" would otherwise return
  // noticeably FASTER than "wrong password", and that timing difference is
  // enough for an attacker to enumerate which emails have accounts without
  // ever seeing an error message say so.
  const passwordMatches = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_HASH_FOR_TIMING_SAFETY,
  );

  if (!user || !passwordMatches) {
    // Same status, same message, either way — "wrong email" and "wrong
    // password" are indistinguishable to the client on purpose.
    throw new AppError(401, "Invalid email or password");
  }

  const token = signSessionToken({ userId: user.id });
  setAuthCookie(res, token);

  res.status(200).json({ id: user.id, email: user.email });
});

authRouter.post("/logout", (_req, res) => {
  // No requireAuth here on purpose: logging out with no session, or a
  // stale/expired one, should just succeed — the end state the client
  // wants ("no cookie") is reached either way.
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out" });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  // requireAuth already confirmed the JWT itself is validly signed and not
  // expired, and set req.userId. Still worth a real database lookup rather
  // than trusting the token alone: it's the only way to notice the account
  // behind it was deleted since the token was issued.
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    clearAuthCookie(res);
    throw new AppError(401, "Not authenticated");
  }

  res.status(200).json({ id: user.id, email: user.email });
});
