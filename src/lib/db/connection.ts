import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";

/**
 * The single place that knows how to connect to PostgreSQL. Shared by the
 * Next.js app and the seed script so the two can never drift apart.
 *
 * ---------------------------------------------------------------------------
 * Why this function also pins the timezone (found the hard way)
 * ---------------------------------------------------------------------------
 * Prisma's pg adapter serialises DateTime values as a *naive* string built from
 * the UTC clock ("2026-10-15 13:30:00", no offset) and, on the way back, reads
 * timestamptz values as if that clock were local time. With a machine in
 * Asia/Kolkata that shifted every event by +05:30: the UI still looked right
 * (the two shifts cancelled out) while the stored instant - and therefore every
 * `eventDate > now()` comparison, report or future mobile client - was 5.5
 * hours wrong.
 *
 * Both halves below are required:
 *   1. `process.env.TZ = "UTC"`              - removes the shift on reads.
 *   2. `options: "-c timezone=UTC"`          - makes Postgres store the naive
 *                                              string as the UTC instant it is.
 *
 * Event times are still *authored and displayed* in IST (see lib/format.ts,
 * which always passes an explicit timeZone), so the UI is unaffected by this.
 */
export function createPrismaClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at a PostgreSQL database.",
    );
  }

  // Must happen before the first query; safe to repeat.
  if (process.env.TZ !== "UTC") {
    process.env.TZ = "UTC";
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, options: "-c timezone=UTC" }),
  });
}
