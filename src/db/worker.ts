/* SQLite runs here, off the main thread. The OPFS SAHPool VFS needs synchronous
   access handles, which are available in a Worker on every modern browser
   (Chrome, Firefox, Safari) — no COOP/COEP headers required. */
import sqlite3InitModule, { type Database, type SqlValue } from '@sqlite.org/sqlite-wasm'
import { MIGRATIONS } from './schema'

const ctx = self as unknown as Worker

type Row = Record<string, SqlValue>
type Op = 'all' | 'get' | 'run' | 'insert'
interface Req {
  id: number
  op: Op
  sql: string
  params?: SqlValue[]
}

let db: Database | null = null

const ready = (async () => {
  const sqlite3 = await sqlite3InitModule()
  try {
    const pool = await sqlite3.installOpfsSAHPoolVfs({ name: 'expensee-monster', initialCapacity: 8 })
    db = new pool.OpfsSAHPoolDb('/expensee.sqlite3')
    console.info('[db-worker] storage: OPFS')
  } catch (err) {
    // Only if OPFS is entirely unavailable (very old browser). Not persistent.
    console.warn('[db-worker] OPFS unavailable, using in-memory.', err)
    db = new sqlite3.oo1.DB(':memory:')
  }
  db.exec('PRAGMA foreign_keys = ON')
  migrate(db)
})()

function migrate(database: Database) {
  const row = database.selectObject('PRAGMA user_version') as Row | undefined
  const current = Number(row?.user_version ?? 0)
  for (let v = current; v < MIGRATIONS.length; v++) {
    database.exec('BEGIN')
    try {
      database.exec(MIGRATIONS[v])
      database.exec(`PRAGMA user_version = ${v + 1}`)
      database.exec('COMMIT')
    } catch (err) {
      database.exec('ROLLBACK')
      throw err
    }
  }
}

// Omit the bind entirely for param-less statements (sqlite-wasm throws otherwise).
function handle(op: Op, sql: string, params?: SqlValue[]): unknown {
  const d = db!
  const bind = params && params.length ? params : undefined
  switch (op) {
    case 'all':
      return bind ? d.selectObjects(sql, bind) : d.selectObjects(sql)
    case 'get':
      return (bind ? d.selectObject(sql, bind) : d.selectObject(sql)) ?? null
    case 'run':
      if (bind) d.exec({ sql, bind })
      else d.exec(sql)
      return null
    case 'insert': {
      if (bind) d.exec({ sql, bind })
      else d.exec(sql)
      const r = d.selectObject('SELECT last_insert_rowid() AS id') as Row | undefined
      return Number(r?.id ?? 0)
    }
  }
}

ctx.onmessage = async (ev: MessageEvent<Req>) => {
  const { id, op, sql, params } = ev.data
  try {
    await ready
    ctx.postMessage({ id, ok: true, result: handle(op, sql, params) })
  } catch (err) {
    ctx.postMessage({ id, ok: false, error: (err as Error).message })
  }
}
