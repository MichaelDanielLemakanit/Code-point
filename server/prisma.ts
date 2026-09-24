import { PrismaClient } from "@prisma/client";
import { getCandidatePostgresUrls, DEFAULT_NEON_DATABASE_URL } from "./db.ts";

let prismaInstance: PrismaClient | null = null;
let isPrismaAvailable: boolean | null = null;

/**
 * Formats PostgreSQL connection URL for optimal resilience with Prisma and Neon serverless
 * (handles PgBouncer mode, connect timeouts, and connection limits).
 */
export function formatPrismaUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  const isNeon = url.includes("neon.tech");
  const isPooler = url.includes("-pooler") || url.includes("pooler.");

  // For Neon pooled endpoints, Prisma requires pgbouncer=true to disable prepared statement pinning
  if ((isNeon || isPooler) && !url.includes("pgbouncer=true")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
  if (!url.includes("connect_timeout=")) {
    url += (url.includes("?") ? "&" : "?") + "connect_timeout=30";
  }
  if (!url.includes("pool_timeout=")) {
    url += (url.includes("?") ? "&" : "?") + "pool_timeout=30";
  }
  return url;
}

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

    const formattedUrl = formatPrismaUrl(activeUrl);

    const client = new PrismaClient({
      datasources: {
        db: {
          url: formattedUrl
        }
      },
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" }
      ]
    });

    // Handle engine error events cleanly:
    // If the serverless Neon database suspended or closed the idle socket, reset prismaInstance
    // so subsequent queries smoothly reconnect on a fresh socket without logging unhandled fatal errors.
    client.$on("error" as any, (e: any) => {
      const msg = typeof e?.message === "string" ? e.message : "";
      if (
        msg.includes("kind: Closed") ||
        msg.includes("Closed, cause: None") ||
        msg.includes("Connection closed")
      ) {
        prismaInstance = null;
        return;
      }
      console.warn("[Prisma Engine Notice]:", msg || e);
    });

    client.$on("warn" as any, (e: any) => {
      const msg = typeof e?.message === "string" ? e.message : "";
      if (!msg.includes("kind: Closed") && !msg.includes("Closed, cause: None")) {
        console.warn("[Prisma Engine Warn]:", msg || e);
      }
    });

    prismaInstance = client;
    isPrismaAvailable = true;
    return prismaInstance;
  } catch (err) {
    console.warn("[Prisma] Failed to instantiate PrismaClient, using fallback DB driver:", err);
    isPrismaAvailable = false;
    return null;
  }
}

/**
 * Safely executes a query with Prisma, automatically reconnecting if the remote
 * serverless PostgreSQL connection was closed due to Neon idle scale-to-zero.
 */
export async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T | null> {
  let prisma = getPrismaClient();
  if (!prisma) {
    return null;
  }

  try {
    return await fn(prisma);
  } catch (err: any) {
    const isClosed =
      err?.message?.includes("kind: Closed") ||
      err?.message?.includes("Closed, cause: None") ||
      err?.message?.includes("Connection closed") ||
      err?.message?.includes("P1001") ||
      err?.message?.includes("P1017") ||
      err?.code === "P1001" ||
      err?.code === "P1017";

    if (isClosed) {
      await disconnectPrisma();
      prisma = getPrismaClient();
      if (prisma) {
        return await fn(prisma);
      }
    }
    throw err;
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
