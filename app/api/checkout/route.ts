import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getStripe, billingReady } from '@/lib/stripe'
import { PRO_PRODUCT } from '@/lib/products'

export async function POST() {
  if (!billingReady()) {
    return NextResponse.json({ error: 'Billing setup pending' }, { status: 503 })
  }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stripe = getStripe()
  const origin = process.env.BETTER_AUTH_URL ?? `https://${process.env.VERCEL_URL ?? 'localhost:3000'}`
  const checkout = await stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: PRO_PRODUCT.name, description: PRO_PRODUCT.description },
            unit_amount: PRO_PRODUCT.priceInCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: { userId: session.user.id, productId: PRO_PRODUCT.id },
    },
    { idempotencyKey: `orbit-pro-${session.user.id}-${new Date().toISOString().slice(0, 10)}` },
  )
  return NextResponse.json({ url: checkout.url })
}
