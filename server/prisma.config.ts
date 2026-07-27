// ---------------------------------------------------------------------------
// Prisma CLI configuration.
//
// This file is used ONLY by `prisma` command-line tools (migrate, db pull,
// studio). It is NOT used by the running application — the app builds its own
// connection in src/lib/prisma.ts. Two different code paths, on purpose.
// ---------------------------------------------------------------------------

// Prisma 7 no longer reads .env automatically. Loading it explicitly means
// there is no hidden magic: this import is why process.env.DATABASE_URL works.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a DIRECT (unpooled) connection to the database.
    //
    // Why: a connection pooler can hand your session to a different backend
    // process between statements. Migrations rely on session-level state
    // (advisory locks that stop two deploys migrating at once, and
    // transactional DDL), so a pooled connection can deadlock or corrupt
    // them. Neon gives you two connection strings for exactly this reason —
    // one with "-pooler" in the host, one without.
    //
    // Locally there is no pooler, so DIRECT_URL and DATABASE_URL hold the
    // same value and the fallback below never fires.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
