CREATE TABLE IF NOT EXISTS orbit_task (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  title text NOT NULL,
  meta text NOT NULL,
  tag text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_subscription (
  id text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "stripeCustomerId" text UNIQUE,
  "stripeSubscriptionId" text UNIQUE,
  status text NOT NULL DEFAULT 'free',
  "currentPeriodEnd" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_thread (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  title text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_message (
  id text PRIMARY KEY,
  "threadId" text NOT NULL,
  "userId" text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_usage (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  day text NOT NULL,
  tokens integer NOT NULL DEFAULT 0,
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_focus_session (
  id text PRIMARY KEY,
  "userId" text NOT NULL,
  minutes integer NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orbit_profile (
  id text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "displayName" text,
  "customInstructions" text,
  theme text NOT NULL DEFAULT 'system',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
