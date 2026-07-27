// ---------------------------------------------------------------------------
// Reads and checks the environment variables the server needs, ONCE, at
// startup. Every other file imports `env` from here instead of touching
// `process.env` directly.
//
// Why bother: `process.env.PORT` is typed as `string | undefined` — nothing
// stops a typo like `process.env.PROT` from silently being `undefined`
// everywhere it's used. Checking every variable in one place, at boot, means
// a missing/misspelled variable crashes the server immediately with a clear
// message, instead of surfacing as a weird bug on the first real request.
// ---------------------------------------------------------------------------

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  port: Number(process.env["PORT"] ?? 4000),

  // The ONE frontend origin allowed to call this API. Required, not
  // defaulted — CORS with a wrong or missing origin fails in a way that's
  // confusing to debug, so we'd rather fail at boot than at request time.
  clientOrigin: required("CLIENT_ORIGIN"),

  // Signs and verifies login sessions (see src/lib/jwt.ts). Required, not
  // defaulted — a fallback secret here would mean every deploy that forgets
  // to set this env var silently shares one hardcoded key, which anyone who
  // reads the source code could use to forge a login for any user.
  jwtSecret: required("JWT_SECRET"),
} as const;

export const isProduction = env.nodeEnv === "production";
