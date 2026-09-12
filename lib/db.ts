import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/lib/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured')
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
export const db = drizzle(pool, { schema })
