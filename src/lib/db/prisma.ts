import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";

import { createPrismaClient } from "./connection";

/**
 * Single PrismaClient for the whole server process. Next.js hot reloads modules
 * in development, so the instance is cached on globalThis to avoid exhausting
 * database connections.
 *
 * Server code only: importing this from a Client Component is a build error.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
