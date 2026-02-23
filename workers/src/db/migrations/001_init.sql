-- Migration 001: Initial schema for multi-user service

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  provider   TEXT NOT NULL,          -- "google" | "github"
  provider_id TEXT NOT NULL,
  email      TEXT,
  name       TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE(provider, provider_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS dynamic_links (
  code       TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active',
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  note       TEXT
);

CREATE INDEX IF NOT EXISTS idx_dynamic_links_user_id ON dynamic_links(user_id);

CREATE TABLE IF NOT EXISTS link_stats (
  code  TEXT NOT NULL REFERENCES dynamic_links(code) ON DELETE CASCADE,
  date  TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (code, date)
);

CREATE TABLE IF NOT EXISTS vcards (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_name       TEXT,
  first_name      TEXT,
  last_name_kana  TEXT,
  first_name_kana TEXT,
  company         TEXT,
  title           TEXT,
  phone           TEXT,
  email           TEXT,
  url             TEXT,
  address         TEXT,
  note            TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_vcards_user_id ON vcards(user_id);
