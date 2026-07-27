// ---------------------------------------------------------------------------
// Zod schemas for the applications API: what a valid create/update/list
// request looks like, checked at runtime before any of it touches Prisma.
// ---------------------------------------------------------------------------

import { z } from "zod";
import { ApplicationStatus } from "../generated/prisma/enums.js";

// Built FROM the Prisma-generated enum object rather than retyped as a
// literal list. If a status is ever added or renamed in schema.prisma, this
// picks it up automatically instead of silently drifting out of sync.
const APPLICATION_STATUS_VALUES = Object.values(ApplicationStatus);
const statusSchema = z.enum(APPLICATION_STATUS_VALUES);

// HTML/JSON forms send "" for an empty optional field, not "absent". This
// treats an empty string the same as "not provided" so an untouched
// optional input doesn't fail URL/text validation.
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\/.+/i.test(v), {
    message: "Must be a valid http(s) URL",
  });

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  role: z.string().trim().min(1, "Role is required"),
  jobLink: optionalUrl,
  notes: optionalText,
  appliedDate: z.coerce.date({ message: "appliedDate must be a valid date" }),

  // No .default() here on purpose: schema.prisma already defaults status to
  // APPLIED at the database level (@default(APPLIED)). Leaving it optional
  // and simply omitting it from the insert when absent means there is ONE
  // place that owns "what a new application's status is" — the database —
  // instead of two places that could quietly drift apart.
  status: statusSchema.optional(),
});

// Every field optional (a PATCH only sends what's changing). jobLink and
// notes additionally accept `null` — that's how a client asks to CLEAR a
// field, which is a different instruction from "leave it alone":
//   field absent from the request -> Zod produces `undefined` -> Prisma
//     leaves the column untouched
//   field explicitly `null`       -> Prisma sets the column to NULL
// Collapsing those two into one case would make "clear the job link" and
// "don't touch the job link" indistinguishable.
export const updateApplicationSchema = z.object({
  company: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  jobLink: z
    .string()
    .trim()
    .refine((v) => /^https?:\/\/.+/i.test(v), { message: "Must be a valid http(s) URL" })
    .nullable()
    .optional(),
  notes: z.string().trim().nullable().optional(),
  appliedDate: z.coerce.date({ message: "appliedDate must be a valid date" }).optional(),
  status: statusSchema.optional(),
});

export const listApplicationsQuerySchema = z.object({
  status: statusSchema.optional(),
  sortBy: z.enum(["appliedDate", "company", "role", "status", "createdAt"]).default("appliedDate"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
