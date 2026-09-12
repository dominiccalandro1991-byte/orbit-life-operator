import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orbitTasks } from '@/lib/schema'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tasks = await db.select().from(orbitTasks).where(eq(orbitTasks.userId, user.id)).orderBy(desc(orbitTasks.createdAt))
  return NextResponse.json({ exportedAt: new Date().toISOString(), user: { email: user.email }, tasks })
}
