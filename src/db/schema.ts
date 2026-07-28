// Schema is applied via ordered migrations. `user_version` tracks the last
// applied index; new migrations are appended to the array, never edited.

export const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    icon       TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE accounts (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    name                  TEXT NOT NULL,
    type                  TEXT NOT NULL,
    opening_balance_cents INTEGER NOT NULL DEFAULT 0,
    currency              TEXT NOT NULL DEFAULT 'USD',
    icon                  TEXT,
    created_at            TEXT NOT NULL
  );

  CREATE TABLE expenses (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    item               TEXT NOT NULL,
    amount_cents       INTEGER NOT NULL,
    currency           TEXT NOT NULL DEFAULT 'USD',
    place              TEXT,
    category_id        INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    account_id         INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    note               TEXT,
    is_unnecessary     INTEGER NOT NULL DEFAULT 0,
    unnecessary_reason TEXT,
    source             TEXT NOT NULL DEFAULT 'manual',
    raw_transcript     TEXT,
    spent_at           TEXT NOT NULL,
    created_at         TEXT NOT NULL,
    updated_at         TEXT NOT NULL
  );

  CREATE TABLE transfers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    from_account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount_cents    INTEGER NOT NULL,
    note            TEXT,
    transferred_at  TEXT NOT NULL,
    created_at      TEXT NOT NULL
  );

  CREATE TABLE budgets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    amount_cents INTEGER NOT NULL,
    period_type  TEXT NOT NULL,
    start_date   TEXT NOT NULL,
    end_date     TEXT,
    category_id  INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at   TEXT NOT NULL
  );

  CREATE INDEX idx_expenses_spent_at ON expenses(spent_at);
  CREATE INDEX idx_expenses_category ON expenses(category_id);
  CREATE INDEX idx_expenses_account  ON expenses(account_id);
  CREATE INDEX idx_transfers_from    ON transfers(from_account_id);
  CREATE INDEX idx_transfers_to      ON transfers(to_account_id);
  `,

  // v2 — app settings / global key-value store (onboarding flag, region, AI, theme…)
  `
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,

  // v3 — seed default expense/budget categories (INSERT OR IGNORE keeps it idempotent-safe)
  `
  INSERT OR IGNORE INTO categories (name, icon, created_at) VALUES
    ('Food',          '🍔', datetime('now')),
    ('Groceries',     '🛒', datetime('now')),
    ('Transport',     '🚗', datetime('now')),
    ('Shopping',      '🛍️', datetime('now')),
    ('Housing',       '🏠', datetime('now')),
    ('Bills',         '💡', datetime('now')),
    ('Entertainment', '🎬', datetime('now')),
    ('Health',        '🏥', datetime('now')),
    ('Travel',        '✈️', datetime('now')),
    ('Education',     '📚', datetime('now')),
    ('Fitness',       '💪', datetime('now')),
    ('Coffee',        '☕', datetime('now')),
    ('Gifts',         '🎁', datetime('now')),
    ('Savings',       '💰', datetime('now')),
    ('Other',         '📦', datetime('now'));
  `,
]
