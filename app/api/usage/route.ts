import { NextResponse } from 'next/server'
import { getEntitlement } from '@/lib/entitlements'
import { requireUserId } from '@/lib/session'

export async function GET() {
  const user = await requireUserId()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entitlement = await getEntitlement(user.id)
  return NextResponse.json({ entitlement })
}
