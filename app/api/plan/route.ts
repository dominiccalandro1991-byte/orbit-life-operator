import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orbitTasks } from '@/lib/schema'
import { decomposeGoal } from '@/lib/planning-engine'
import { requireUserId } from '@/lib/session'

export async function POST(request: Request) {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const goal = typeof body?.goal === 'string' ? body.goal.trim().slice(0, 400) : ''
  if (!goal) return NextResponse.json({ error: 'Goal is required.' }, { status: 400 })
  const steps = decomposeGoal(goal)
  const inserted = []
  for (const step of steps) {
    const task = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: step.title,
      meta: `Plan · ${step.minutes} min`,
      tag: step.tag,
    }
    await db.insert(orbitTasks).values(task)
    inserted.push(task)
  }
  return NextResponse.json({ steps: inserted })
}
