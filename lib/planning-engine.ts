export type PlanStep = {
  title: string
  minutes: number
  tag: string
}

const STOP = new Set(['the', 'a', 'an', 'to', 'for', 'and', 'or', 'of', 'my', 'our'])

export function decomposeGoal(input: string): PlanStep[] {
  const clean = input.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const words = clean.split(' ').filter((w) => !STOP.has(w.toLowerCase()))
  const noun = words.slice(0, 4).join(' ') || 'the work'
  return [
    { title: `Clarify outcome for ${noun}`, minutes: 15, tag: 'Scope' },
    { title: `Break ${noun} into a first shippable slice`, minutes: 25, tag: 'Plan' },
    { title: `Execute the first slice of ${noun}`, minutes: 50, tag: 'Focus' },
    { title: `Review blockers on ${noun}`, minutes: 15, tag: 'Review' },
  ]
}

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}
