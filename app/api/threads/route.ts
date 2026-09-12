import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orbitThreads } from '@/lib/schema'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const threads = await db.select().from(orbitThreads).where(eq(orbitThreads.userId, user.id)).orderBy(desc(orbitThreads.updatedAt))
  return NextResponse.json({ threads })
}

export async function POST(request: Request) {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 120) : 'New thread'
  const thread = { id: crypto.randomUUID(), userId: user.id, title }
  await db.insert(orbitThreads).values(thread)
  return NextResponse.json({ thread }, { status: 201 })
}
