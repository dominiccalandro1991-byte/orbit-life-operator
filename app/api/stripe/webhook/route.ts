import { NextResponse } from 'next/server'
import { getStripe, billingReady } from '@/lib/stripe'
import { db } from '@/lib/db'
import { orbitSubscriptions } from '@/lib/schema'

export async function POST(request: Request) {
  if (!billingReady()) {
    return NextResponse.json({ error: 'Billing setup pending' }, { status: 503 })
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  const stripe = getStripe()
  let event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }
  const object = event.data.object as {
    metadata?: { userId?: string }
    customer?: string
    id?: string
    status?: string
    current_period_end?: number
  }
  const userId = object.metadata?.userId
  if (userId && ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : (object.status ?? 'active')
    await db
      .insert(orbitSubscriptions)
      .values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: typeof object.customer === 'string' ? object.customer : null,
        stripeSubscriptionId: object.id ?? null,
        status,
        currentPeriodEnd: object.current_period_end ? new Date(object.current_period_end * 1000) : null,
      })
      .onConflictDoUpdate({
        target: orbitSubscriptions.userId,
        set: {
          status,
          stripeCustomerId: typeof object.customer === 'string' ? object.customer : undefined,
          stripeSubscriptionId: object.id,
          currentPeriodEnd: object.current_period_end ? new Date(object.current_period_end * 1000) : null,
          updatedAt: new Date(),
        },
      })
  }
  return NextResponse.json({ received: true })
}
