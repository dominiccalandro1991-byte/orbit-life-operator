import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const orbitTasks = pgTable('orbit_task', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  meta: text('meta').notNull(),
  tag: text('tag').notNull(),
  done: boolean('done').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orbitSubscriptions = pgTable('orbit_subscription', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  stripeCustomerId: text('stripeCustomerId').unique(),
  stripeSubscriptionId: text('stripeSubscriptionId').unique(),
  status: text('status').notNull().default('free'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orbitThreads = pgTable('orbit_thread', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orbitMessages = pgTable('orbit_message', {
  id: text('id').primaryKey(),
  threadId: text('threadId').notNull(),
  userId: text('userId').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const orbitUsage = pgTable('orbit_usage', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  day: text('day').notNull(),
  tokens: integer('tokens').notNull().default(0),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orbitFocusSessions = pgTable('orbit_focus_session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  minutes: integer('minutes').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const orbitProfiles = pgTable('orbit_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  displayName: text('displayName'),
  customInstructions: text('customInstructions'),
  theme: text('theme').notNull().default('system'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
