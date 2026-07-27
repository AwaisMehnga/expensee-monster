import sqlite3InitModule, {
  type Database,
  type SqlValue,
} from '@sqlite.org/sqlite-wasm'
import { MIGRATIONS } from './schema'

type Row = Record<string, SqlValue>
export type Params = SqlValue[]

let dbPromise: Promise<Database> | null = null

async function open(): Promise<Database> {
  const sqlite3 = await sqlite3InitModule()
  let db: Database
  try {
    // OPFS SAHPool: persistent, main-thread, no COOP/COEP headers needed.
    const pool = await sqlite3.installOpfsSAHPoolVfs({
      name: 'expensee-monster',
      initialCapacity: 8,
    })
    db = new pool.OpfsSAHPoolDb('/expensee.sqlite3')
  } catch (err) {
    // Fallback keeps the app usable even where OPFS is unavailable (data won't persist).
    console.warn('[db] OPFS unavailable — using in-memory database.', err)
    db = new sqlite3.oo1.DB(':memory:')
  }
  db.exec('PRAGMA foreign_keys = ON')
  migrate(db)
  return db
}

function migrate(db: Database) {
  const row = db.selectObject('PRAGMA user_version') as Row | undefined
  const current = Number(row?.user_version ?? 0)
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN')
    try {
      db.exec(MIGRATIONS[v])
      db.exec(`PRAGMA user_version = ${v + 1}`)
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }
  }
}

/** Opens (once) and migrates the database. Safe to call repeatedly. */
export function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = open()
  return dbPromise
}

/** Awaitable "ensure ready" for app bootstrap. */
export async function initDb(): Promise<void> {
  await getDb()
}

export async function all<T = Row>(sql: string, params: Params = []): Promise<T[]> {
  const db = await getDb()
  return db.selectObjects(sql, params) as unknown as T[]
}

export async function get<T = Row>(sql: string, params: Params = []): Promise<T | undefined> {
  const db = await getDb()
  return db.selectObject(sql, params) as unknown as T | undefined
}

export async function scalar<T extends SqlValue = SqlValue>(
  sql: string,
  params: Params = [],
): Promise<T | undefined> {
  const row = await get<Row>(sql, params)
  return row ? (Object.values(row)[0] as T) : undefined
}

export async function run(sql: string, params: Params = []): Promise<void> {
  const db = await getDb()
  db.exec({ sql, bind: params })
}

/** Runs an INSERT and returns the new rowid. */
export async function insert(sql: string, params: Params = []): Promise<number> {
  const db = await getDb()
  db.exec({ sql, bind: params })
  const row = db.selectObject('SELECT last_insert_rowid() AS id') as Row | undefined
  return Number(row?.id ?? 0)
}

/** Wraps `fn` in a transaction; rolls back on throw. */
export async function tx<T>(fn: () => Promise<T> | T): Promise<T> {
  const db = await getDb()
  db.exec('BEGIN')
  try {
    const result = await fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}
