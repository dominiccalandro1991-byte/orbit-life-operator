'use client'

import { useMemo, useState } from 'react'
import { Flame, Inbox, LayoutDashboard, Plus, Sparkles, Target } from 'lucide-react'

type Task = { id: string | number; userId?: string; title: string; meta: string; done: boolean; tag: string }
type Entitlement = { status: string; pro: boolean; tokensUsed: number; tokenLimit: number; remaining: number }

const navItems = [
  { label: 'Today', icon: LayoutDashboard },
  { label: 'Inbox', icon: Inbox },
  { label: 'Focus', icon: Target },
  { label: 'Progress', icon: Flame },
]

export default function OrbitApp({
  user,
  initialTasks,
  entitlement: initialEntitlement,
}: {
  user: { name?: string | null; email: string }
  initialTasks: Task[]
  entitlement: Entitlement
}) {
  const [activeNav, setActiveNav] = useState('Today')
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [capture, setCapture] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [entitlement, setEntitlement] = useState(initialEntitlement)
  const [billingMessage, setBillingMessage] = useState('')

  const completed = tasks.filter((task) => task.done).length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  }, [])

  async function addTask(event: React.FormEvent) {
    event.preventDefault()
    const title = capture.trim()
    if (!title) return
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) return
    const { task } = await response.json()
    setTasks((current) => [task, ...current])
    setCapture('')
  }

  async function toggleTask(id: string | number) {
    const current = tasks.find((task) => String(task.id) === String(id))
    if (!current) return
    const response = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: String(id), done: !current.done }),
    })
    if (!response.ok) return
    const { task } = await response.json()
    setTasks((items) => items.map((item) => (String(item.id) === String(id) ? task : item)))
  }

  async function askOrbit() {
    if (!capture.trim() || isThinking) return
    if (entitlement.remaining <= 0) {
      setAiResponse('Daily token limit reached. Upgrade when billing is live.')
      return
    }
    setIsThinking(true)
    setAiResponse('')
    const response = await fetch('/api/orbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: capture }),
    })
    const data = await response.json()
    setAiResponse(data.text ?? data.error ?? 'Orbit is unavailable.')
    if (data.entitlement) setEntitlement(data.entitlement)
    setIsThinking(false)
  }

  async function planGoal() {
    if (!capture.trim()) return
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: capture }),
    })
    if (!response.ok) return
    const { steps } = await response.json()
    setTasks((current) => [...steps, ...current])
    setCapture('')
  }

  async function upgrade() {
    const response = await fetch('/api/checkout', { method: 'POST' })
    const data = await response.json()
    if (response.status === 503) {
      setBillingMessage(data.error ?? 'Billing setup pending')
      return
    }
    if (data.url) window.location.href = data.url
  }

  const visible = activeNav === 'Inbox' ? tasks.filter((t) => !t.done) : tasks

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 p-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">orbit</p>
          <p className="mt-3 text-sm text-muted-foreground">{user.name || user.email}</p>
          <nav className="mt-6 grid gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${activeNav === item.label ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl bg-muted p-3 text-xs">
            <p className="font-medium">Tokens</p>
            <p className="mt-1 text-muted-foreground">
              {entitlement.tokensUsed} / {entitlement.tokenLimit}
            </p>
            <p className="mt-1">{entitlement.pro ? 'Pro' : 'Free'}</p>
          </div>
          <button onClick={upgrade} className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm">
            Upgrade
          </button>
          {billingMessage && <p className="mt-2 text-xs text-muted-foreground">{billingMessage}</p>}
        </aside>
        <main className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{greeting}</p>
              <h1 className="text-3xl font-semibold tracking-tight">Make space for what matters.</h1>
            </div>
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
          <form onSubmit={addTask} className="mt-6 flex flex-wrap gap-2">
            <input
              value={capture}
              onChange={(e) => setCapture(e.target.value)}
              placeholder="Capture a thought or a goal"
              className="min-w-[240px] flex-1 rounded-xl border border-input bg-background px-4 py-3 outline-none"
            />
            <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              <Plus size={16} /> Add
            </button>
            <button type="button" onClick={planGoal} className="rounded-xl border border-border px-4 py-3 text-sm">
              Decompose
            </button>
            <button type="button" onClick={askOrbit} className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm">
              <Sparkles size={16} /> Ask Orbit
            </button>
          </form>
          {aiResponse && <p className="mt-4 rounded-2xl bg-muted p-4 text-sm leading-6">{isThinking ? 'Thinking…' : aiResponse}</p>}
          <ul className="mt-6 grid gap-2">
            {visible.map((task) => (
              <li key={String(task.id)} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <button onClick={() => toggleTask(task.id)} className="text-left">
                  <p className={task.done ? 'text-muted-foreground line-through' : 'font-medium'}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.tag} · {task.meta}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  )
}
