'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result =
      mode === 'sign-up'
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })
    if (result.error) setError('We could not authenticate those details. Check them and try again.')
    else {
      router.push('/')
      router.refresh()
    }
    setPending(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">orbit</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {mode === 'sign-up' ? 'Create your orbit.' : 'Welcome back.'}
        </h1>
        {mode === 'sign-up' && (
          <label className="mt-6 block text-sm font-medium">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3 outline-none" />
          </label>
        )}
        <label className="mt-5 block text-sm font-medium">
          Email
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3 outline-none" />
        </label>
        <label className="mt-5 block text-sm font-medium">
          Password
          <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3 outline-none" />
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        <button disabled={pending} className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {pending ? 'Working...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
        </button>
        <a href={mode === 'sign-up' ? '/sign-in' : '/sign-up'} className="mt-5 block text-center text-sm text-muted-foreground underline">
          {mode === 'sign-up' ? 'Already have an account?' : 'Create an account'}
        </a>
      </form>
    </main>
  )
}
