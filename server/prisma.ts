import { PrismaClient } from "@prisma/client";
import { getCandidatePostgresUrls, DEFAULT_NEON_DATABASE_URL } from "./db.ts";

let prismaInstance: PrismaClient | null = null;
let isPrismaAvailable: boolean | null = null;

/**
 * Returns a configured PrismaClient connected to the live PostgreSQL / Neon database.
 */
export function getPrismaClient(): PrismaClient | null {
  if (prismaInstance) return prismaInstance;

  try {
    const candidates = getCandidatePostgresUrls();
    const activeUrl = candidates.length > 0 ? candidates[0] : (process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL);

    if (!activeUrl || (!activeUrl.startsWith("postgres://") && !activeUrl.startsWith("postgresql://"))) {
      return null;
    }

    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: activeUrl
        }
      },
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
    });

    isPrismaAvailable = true;
    return prismaInstance;
  } catch (err) {
    console.warn("[Prisma] Failed to instantiate PrismaClient, using fallback DB driver:", err);
    isPrismaAvailable = false;
    return null;
  }
}

/**
 * Safely disconnects Prisma on shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
    } catch {
      // Ignore disconnect errors during process exit
    }
    prismaInstance = null;
  }
}
