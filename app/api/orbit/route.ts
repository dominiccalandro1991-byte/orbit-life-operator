import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { consumeTokens, getEntitlement } from '@/lib/entitlements'
import { estimateTokens } from '@/lib/planning-engine'
import { requireUserId } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const user = await requireUserId()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => null)
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 2000) : ''
    if (!prompt) return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })

    const entitlement = await getEntitlement(user.id)
    const cost = estimateTokens(prompt) + 220
    if (entitlement.remaining < cost) {
      return NextResponse.json({ error: 'Daily token limit reached.', entitlement }, { status: 402 })
    }

    const result = await generateText({
      model: 'openai/gpt-5.4-mini',
      system:
        'You are Orbit, a concise and warm thinking partner for creators, founders, and everyday people. Give practical perspective in 2-4 sentences, then one clear next action. Do not claim to have performed actions you cannot perform.',
      prompt,
      maxOutputTokens: 220,
    })
    await consumeTokens(user.id, estimateTokens(prompt) + estimateTokens(result.text))
    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error('Orbit generation failed:', error)
    return NextResponse.json({ error: 'Orbit is temporarily unavailable.' }, { status: 503 })
  }
}
