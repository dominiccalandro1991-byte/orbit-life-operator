import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orbitTasks } from '@/lib/schema'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tasks = await db.select().from(orbitTasks).where(eq(orbitTasks.userId, user.id)).orderBy(desc(orbitTasks.createdAt))
  return NextResponse.json({ tasks })
}

export async function POST(request: Request) {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 200) : ''
  if (!title) return NextResponse.json({ error: 'Task title is required.' }, { status: 400 })
  const task = {
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    meta: typeof body?.meta === 'string' ? body.meta : 'Just added · 25 min',
    tag: typeof body?.tag === 'string' ? body.tag : 'Inbox',
  }
  await db.insert(orbitTasks).values(task)
  return NextResponse.json({ task }, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (typeof body?.id !== 'string' || typeof body?.done !== 'boolean') {
    return NextResponse.json({ error: 'Invalid task update.' }, { status: 400 })
  }
  const [task] = await db
    .update(orbitTasks)
    .set({ done: body.done, updatedAt: new Date() })
    .where(and(eq(orbitTasks.id, body.id), eq(orbitTasks.userId, user.id)))
    .returning()
  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function DELETE(request: Request) {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (typeof body?.id !== 'string') return NextResponse.json({ error: 'Invalid task id.' }, { status: 400 })
  const deleted = await db
    .delete(orbitTasks)
    .where(and(eq(orbitTasks.id, body.id), eq(orbitTasks.userId, user.id)))
    .returning({ id: orbitTasks.id })
  if (!deleted.length) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
