-- Optional Cloudflare D1 schema for the next persistence layer.
CREATE TABLE IF NOT EXISTS odds_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id TEXT NOT NULL,
  player_id TEXT,
  market TEXT NOT NULL,
  bookmaker TEXT,
  odds REAL,
  captured_at TEXT NOT NULL,
  phase TEXT CHECK(phase IN ('opening','current','closing')) DEFAULT 'current'
);
CREATE INDEX IF NOT EXISTS idx_odds_fixture_player_time ON odds_snapshots(fixture_id,player_id,captured_at);

CREATE TABLE IF NOT EXISTS scorer_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fixture_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  status TEXT NOT NULL,
  indispensable_score INTEGER,
  form_context_score INTEGER,
  data_completeness INTEGER,
  signal_odds REAL,
  created_at TEXT NOT NULL,
  result TEXT DEFAULT 'PENDING',
  closing_odds REAL,
  settled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_signals_fixture_player ON scorer_signals(fixture_id,player_id);
