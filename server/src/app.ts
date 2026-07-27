// ---------------------------------------------------------------------------
// Builds the Express app: middleware, routes, error handling.
//
// This file only CONFIGURES the app — it does not call `.listen()`. That
// split matters later: a test can import `app` and send fake requests to it
// without opening a real network port. `src/index.ts` is the only file that
// actually starts listening.
// ---------------------------------------------------------------------------

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

// ---- CORS -------------------------------------------------------------
//
// THIS IS THE FRONTEND <-> BACKEND SEAM.
//
// The browser enforces the "same-origin policy": JavaScript running on
// http://localhost:5173 is, by default, NOT allowed to read a response from
// http://localhost:4000 — different port means a different "origin", even
// on the same machine. This isn't a bug to route around; it's the browser
// protecting a user from a malicious page silently calling other sites'
// APIs using the user's own cookies.
//
// CORS (Cross-Origin Resource Sharing) is the backend explicitly opting IN:
// "requests from this exact origin are allowed, and here is what they may
// send." Express doesn't do this by default — the `cors` package adds the
// response headers that tell the browser it's allowed.
//
//   origin: env.clientOrigin
//     Only this one exact origin may call the API. Not "*" (any website) —
//     credentialed requests (see below) are not allowed to use "*" anyway,
//     and there's no reason a random site should be able to call this API.
//
//   credentials: true
//     Step 4 stores the login session in an httpOnly cookie. Cookies are
//     NOT sent cross-origin, and the browser will not even expose the
//     response to JS, unless both sides say they allow it: this flag on the
//     server, and `credentials: "include"` on every fetch() in the React
//     app. Miss either side and the cookie silently never arrives.
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);

// Parses a JSON request body (e.g. the login form's { email, password })
// into req.body. Without this, req.body is undefined and every POST route
// would have to parse the raw request stream by hand.
app.use(express.json());

// Parses the Cookie request header into req.cookies. Needed starting in
// step 4, to read the httpOnly session cookie back out on each request.
app.use(cookieParser());

// ---- Routes -------------------------------------------------------------

app.use(healthRouter);
// Step 4 adds: app.use("/api/auth", authRouter);
// Step 5 adds: app.use("/api/applications", applicationsRouter);

// ---- Error handling -------------------------------------------------------
//
// Order matters here and it is not arbitrary:
//   1. notFoundHandler runs only if no route above matched.
//   2. errorHandler is LAST so it also catches errors passed via next(err)
//      from any route or from notFoundHandler.
app.use(notFoundHandler);
app.use(errorHandler);
