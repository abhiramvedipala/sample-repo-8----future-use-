/**
 * Step 1 placeholder.
 *
 * This file exists only to prove the toolchain works end to end:
 * TypeScript source -> tsx (dev) or tsc + node (prod) -> running process.
 *
 * Step 3 replaces this with the real Express server.
 */

// The `: string` and `: Date` annotations are the point of this file.
// If TypeScript were not wired up correctly, these would be syntax errors.
const serviceName: string = "job-app-tracker-server";
const startedAt: Date = new Date();

console.log(`[${serviceName}] toolchain OK`);
console.log(`[${serviceName}] node ${process.version}`);
console.log(`[${serviceName}] started at ${startedAt.toISOString()}`);
