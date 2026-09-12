export const PRO_PRODUCT = {
  id: 'orbit-pro-monthly',
  name: 'Orbit Pro',
  priceInCents: 899,
  description: 'Unlimited AI perspective, planning, and focus analytics.',
  freeDailyTokens: 4000,
  proDailyTokens: 80000,
} as const

export function dailyTokenLimit(status: string | null | undefined) {
  return status === 'active' || status === 'trialing' ? PRO_PRODUCT.proDailyTokens : PRO_PRODUCT.freeDailyTokens
}

export function isPro(status: string | null | undefined) {
  return status === 'active' || status === 'trialing'
}
