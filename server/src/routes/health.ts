// ---------------------------------------------------------------------------
// GET /health
//
// A "health check" — an endpoint whose only job is to answer "is this
// process up and responding?". It does no auth, touches no database, and
// returns instantly. Railway (and any load balancer) calls this on a timer;
// if it stops responding, the platform knows to restart or stop routing
// traffic to this instance.
//
// Deliberately NOT checking the database here: a health check is about the
// PROCESS being alive, not every dependency. Mixing the two means a slow
// database can make Railway think the whole server is dead and kill a
// perfectly healthy process.
// ---------------------------------------------------------------------------

import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
