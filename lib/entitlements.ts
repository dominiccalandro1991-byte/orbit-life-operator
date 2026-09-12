import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orbitSubscriptions, orbitUsage } from '@/lib/schema'
import { dailyTokenLimit, isPro } from '@/lib/products'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function getEntitlement(userId: string) {
  const [sub] = await db.select().from(orbitSubscriptions).where(eq(orbitSubscriptions.userId, userId)).limit(1)
  const day = todayKey()
  const [usage] = await db.select().from(orbitUsage).where(eq(orbitUsage.userId, userId)).limit(1)
  const tokens = usage && usage.day === day ? usage.tokens : 0
  const status = sub?.status ?? 'free'
  const limit = dailyTokenLimit(status)
  return {
    status,
    pro: isPro(status),
    tokensUsed: tokens,
    tokenLimit: limit,
    remaining: Math.max(0, limit - tokens),
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
  }
}

export async function consumeTokens(userId: string, tokens: number) {
  const day = todayKey()
  const [existing] = await db.select().from(orbitUsage).where(eq(orbitUsage.userId, userId)).limit(1)
  if (!existing) {
    await db.insert(orbitUsage).values({
      id: crypto.randomUUID(),
      userId,
      day,
      tokens,
    })
    return
  }
  const next = existing.day === day ? existing.tokens + tokens : tokens
  await db
    .update(orbitUsage)
    .set({ day, tokens: next, updatedAt: new Date() })
    .where(eq(orbitUsage.id, existing.id))
}
