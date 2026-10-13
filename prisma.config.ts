import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 reads its configuration from this file instead of from the
// datasource block in schema.prisma, and it no longer loads `.env` on its own
// (hence the `dotenv/config` import above).
//
// `process.env.DATABASE_URL ?? ""` is deliberate: `prisma generate` needs no
// database connection, so a missing .env should not break `npm install`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
