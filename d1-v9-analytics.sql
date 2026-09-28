-- V11.9 / V9 analytics migration
-- Run this once in Cloudflare D1 Console.

CREATE TABLE IF NOT EXISTS site_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  path TEXT NOT NULL,
  title TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  ip_address TEXT,
  visitor_hash TEXT NOT NULL,
  user_agent TEXT,
  language TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_visits_date
ON site_visits(visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visits_visitor
ON site_visits(visitor_hash);

CREATE INDEX IF NOT EXISTS idx_site_visits_country
ON site_visits(country);

CREATE INDEX IF NOT EXISTS idx_site_visits_path
ON site_visits(path);
