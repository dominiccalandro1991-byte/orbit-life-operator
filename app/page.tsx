import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import OrbitApp from '@/components/orbit-app'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orbitTasks } from '@/lib/schema'
import { getEntitlement } from '@/lib/entitlements'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const tasks = await db
    .select()
    .from(orbitTasks)
    .where(eq(orbitTasks.userId, session.user.id))
    .orderBy(desc(orbitTasks.createdAt))
  const entitlement = await getEntitlement(session.user.id)
  return <OrbitApp user={session.user} initialTasks={tasks} entitlement={entitlement} />
}
