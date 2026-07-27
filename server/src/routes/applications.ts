// ---------------------------------------------------------------------------
// GET    /api/applications      list (filter by status, sort)
// POST   /api/applications      create
// GET    /api/applications/:id  read one
// PATCH  /api/applications/:id  partial update
// DELETE /api/applications/:id  delete
//
// Every route here requires a logged-in user, and every query is scoped to
// THAT user's own rows. That scoping is the actual security boundary of this
// file — see the comment above updateMany/deleteMany below.
// ---------------------------------------------------------------------------

import { Router } from "express";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { prisma } from "../lib/prisma.js";
import {
  createApplicationSchema,
  listApplicationsQuerySchema,
  updateApplicationSchema,
  type CreateApplicationInput,
  type ListApplicationsQuery,
  type UpdateApplicationInput,
} from "../schemas/applications.js";

export const applicationsRouter = Router();

// Applies to every route defined below in this file — mounted BEFORE any of
// them, so a request with no/invalid session never reaches a handler.
applicationsRouter.use(requireAuth);

applicationsRouter.get("/", validateQuery(listApplicationsQuerySchema), async (req, res) => {
  const { status, sortBy, order } = req.validatedQuery as ListApplicationsQuery;

  const applications = await prisma.application.findMany({
    where: {
      userId: req.userId,
      ...(status ? { status } : {}),
    },
    orderBy: { [sortBy]: order },
  });

  res.status(200).json(applications);
});

applicationsRouter.post("/", validateBody(createApplicationSchema), async (req, res) => {
  const data = req.body as CreateApplicationInput;

  const application = await prisma.application.create({
    data: {
      ...data,
      // The one field the CLIENT never gets to set directly: which user
      // owns this row. It comes from the verified session (requireAuth),
      // never from the request body — otherwise anyone could create an
      // application under someone else's account just by sending a
      // different userId in JSON.
      userId: req.userId!,
    },
  });

  res.status(201).json(application);
});

applicationsRouter.get("/:id", async (req, res) => {
  // Express types req.params[key] as `string | string[]` in general (a
  // route like /*splat can capture repeated segments as an array); a
  // single named segment like :id can only ever be one string at runtime.
  const id = req.params.id as string;

  // findFirst with a COMPOUND where — id AND userId together — rather than
  // findUnique({ where: { id } }) followed by a separate "is this yours?"
  // check. One query that structurally cannot return a row you don't own,
  // instead of two steps where the second one could be forgotten.
  const application = await prisma.application.findFirst({
    where: { id, userId: req.userId },
  });

  if (!application) {
    // 404, not 403. Telling an attacker "403 Forbidden" confirms a row
    // with that id exists (just not theirs) — "404 Not Found" reveals
    // nothing about whether it exists at all.
    throw new AppError(404, "Application not found");
  }

  res.status(200).json(application);
});

applicationsRouter.patch("/:id", validateBody(updateApplicationSchema), async (req, res) => {
  const id = req.params.id as string;
  const data = req.body as UpdateApplicationInput;

  // THE key line in this file. updateMany with where: { id, userId } makes
  // "is this my row?" and "update it" a single atomic database operation.
  // The tempting-looking alternative —
  //   prisma.application.update({ where: { id: req.params.id }, data })
  // — has no userId in it at all: it would update ANY user's application
  // by id, and Prisma's own types allow it, because `id` alone is already
  // unique. Nothing but the (userId, id) pair in the where clause stops
  // one logged-in user from editing another user's data.
  const result = await prisma.application.updateMany({
    where: { id, userId: req.userId },
    data,
  });

  if (result.count === 0) {
    throw new AppError(404, "Application not found");
  }

  // updateMany returns only a count, not the row — Prisma doesn't fetch it
  // in the same round trip. A second query gets the current state to
  // return to the client.
  const application = await prisma.application.findUnique({ where: { id } });
  res.status(200).json(application);
});

applicationsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id as string;

  // Same reasoning as the update above: deleteMany with a compound
  // (id, userId) where clause, not delete({ where: { id } }).
  const result = await prisma.application.deleteMany({
    where: { id, userId: req.userId },
  });

  if (result.count === 0) {
    throw new AppError(404, "Application not found");
  }

  // 204 No Content: the standard response for "deleted, nothing to return".
  res.status(204).send();
});
