// ---------------------------------------------------------------------------
// The database connection. THIS IS THE BACKEND <-> DATABASE SEAM.
//
// Everything the app ever reads or writes goes through the `prisma` object
// exported at the bottom of this file. Nothing else in the codebase should
// import `pg` or construct a PrismaClient.
// ---------------------------------------------------------------------------

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Fail loudly and immediately if the connection string is missing.
//
// Without this check, `new PrismaPg({ connectionString: undefined })` builds
// fine and the app starts happily — then the FIRST user request dies with an
// obscure driver error. A misconfigured server should refuse to boot, not
// pretend to work. This is the cheapest error handling in the whole project.
const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.",
  );
}

// Prisma 7 talks to Postgres through a "driver adapter" — a real Node driver
// (`pg`) rather than a bundled native engine binary. Practical consequences:
//   - connection pooling is `pg`'s, so it is configurable and inspectable
//   - the same adapter works against local Postgres and Neon unchanged;
//     only the connection string differs
const adapter = new PrismaPg({ connectionString });

// A single shared client for the whole process.
//
// This is a plain module-level constant, which is all a singleton needs to be:
// ES modules are evaluated ONCE and cached, so every `import { prisma }`
// anywhere in the app receives this exact object. That matters because a
// PrismaClient owns a pool of TCP connections to Postgres. Creating one per
// request would open hundreds of sockets and exhaust the database's
// connection limit within minutes.
export const prisma = new PrismaClient({
  // Log every SQL query in development so you can SEE what Prisma sends to
  // Postgres. Silent in production, where it would leak data into logs and
  // slow things down.
  log: process.env["NODE_ENV"] === "development" ? ["query", "warn", "error"] : ["error"],

  adapter,
});
