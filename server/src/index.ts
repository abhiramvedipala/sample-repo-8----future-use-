// ---------------------------------------------------------------------------
// The entrypoint. The ONLY file that actually starts listening for requests.
// Everything else (app.ts, routes, middleware) just builds up configuration;
// this is where it becomes a real running server.
// ---------------------------------------------------------------------------

// Load .env into process.env before anything else runs. env.ts reads
// process.env at import time, so this import must come first.
import "dotenv/config";

import { app } from "./app.js";
import { env } from "./lib/env.js";

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  console.log(`[server] accepting requests from ${env.clientOrigin}`);
  console.log(`[server] environment: ${env.nodeEnv}`);
});
