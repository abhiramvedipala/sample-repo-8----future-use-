// ---------------------------------------------------------------------------
// Where the JWT actually lives: an httpOnly cookie.
//
// Two ways an API could hand a client a login token:
//   1. Return it in the JSON body; the frontend stores it (e.g. in
//      localStorage) and attaches it to every request by hand.
//   2. Set it as an httpOnly cookie; the BROWSER attaches it automatically.
//
// We use (2). localStorage is readable by any JavaScript running on the
// page — including a malicious script injected by an XSS bug in some
// dependency. An httpOnly cookie is invisible to JavaScript entirely
// (`document.cookie` can't see it), so stealing it requires a deeper
// compromise than a single XSS bug. This is the standard, boring, safer
// default for a browser-based app.
// ---------------------------------------------------------------------------

import type { Response } from "express";
import { isProduction } from "./env.js";

export const AUTH_COOKIE_NAME = "session";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Cookie options differ between local dev and production, and the reason is
// entirely about domains:
//
// Locally, the frontend (localhost:5173) and API (localhost:4000) differ
// only in PORT. Browsers treat that as the same "site", so a normal
// `sameSite: "lax"` cookie is sent on cross-port fetches without issue.
//
// In production, the frontend (vercel.app) and API (up.railway.app) are on
// completely different domains — genuinely cross-site. A cross-site cookie
// is only ever sent if it's marked `sameSite: "none"`, and browsers refuse
// to accept `sameSite: "none"` unless `secure: true` (HTTPS-only) is also
// set — which is exactly what production already is.
function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
}

export function clearAuthCookie(res: Response): void {
  // clearCookie must be called with the SAME options (minus maxAge) used to
  // set the cookie, or the browser treats it as a different cookie and
  // won't remove the original one.
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}
