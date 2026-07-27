/**
 * Step 2 placeholder.
 *
 * Proves the full backend->database path works:
 *   .env -> dotenv -> PrismaPg adapter -> pg driver -> Postgres -> typed result
 *
 * Step 3 replaces this with the real Express server.
 */

// Load .env into process.env BEFORE anything reads it. This import must come
// first — src/lib/prisma.ts checks DATABASE_URL at import time, and ES module
// imports are evaluated in order.
import "dotenv/config";

import { prisma } from "./lib/prisma.js";

async function main(): Promise<void> {
  console.log("[db] connecting...");

  // These two calls are real SQL. Because the client was generated from
  // schema.prisma, `prisma.user` and `prisma.application` exist and are
  // typed; `prisma.userz` would be a compile error, not a 3am pager.
  const [userCount, applicationCount] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
  ]);

  console.log("[db] connected OK");
  console.log(`[db] users:        ${userCount}`);
  console.log(`[db] applications: ${applicationCount}`);
}

main()
  .catch((error: unknown) => {
    // If the database is unreachable or misconfigured, say so clearly and
    // exit non-zero. A non-zero exit code is how Railway, Docker and CI learn
    // that the process failed — exiting 0 on failure makes a broken deploy
    // look healthy.
    console.error("[db] connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Close the connection pool so the process can exit cleanly instead of
    // hanging with open sockets.
    await prisma.$disconnect();
  });
