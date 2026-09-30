CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  creator_hash TEXT NOT NULL,
  state TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rooms_creator_date ON rooms(creator_hash, created_at);
