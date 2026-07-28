import type { SqlValue } from '@sqlite.org/sqlite-wasm'

type Row = Record<string, SqlValue>
export type Params = SqlValue[]
type Op = 'all' | 'get' | 'run' | 'insert'

interface Pending {
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, Pending>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (ev: MessageEvent) => {
      const { id, ok, result, error } = ev.data as {
        id: number
        ok: boolean
        result?: unknown
        error?: string
      }
      const p = pending.get(id)
      if (!p) return
      pending.delete(id)
      if (ok) p.resolve(result)
      else p.reject(new Error(error))
    }
    worker.onerror = (e) => console.error('[db] worker error', e)
  }
  return worker
}

function call<T>(op: Op, sql: string, params: Params = []): Promise<T> {
  const id = ++seq
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    getWorker().postMessage({ id, op, sql, params })
  })
}

/** Warms up the worker + runs migrations. Safe to call repeatedly. */
export function initDb(): Promise<void> {
  return call<unknown>('run', 'SELECT 1').then(() => undefined)
}

export function all<T = Row>(sql: string, params: Params = []): Promise<T[]> {
  return call<T[]>('all', sql, params)
}

export async function get<T = Row>(sql: string, params: Params = []): Promise<T | undefined> {
  const row = await call<T | null>('get', sql, params)
  return row ?? undefined
}

export async function scalar<T extends SqlValue = SqlValue>(
  sql: string,
  params: Params = [],
): Promise<T | undefined> {
  const row = await get<Row>(sql, params)
  return row ? (Object.values(row)[0] as T) : undefined
}

export function run(sql: string, params: Params = []): Promise<void> {
  return call<null>('run', sql, params).then(() => undefined)
}

/** Runs an INSERT and returns the new rowid. */
export function insert(sql: string, params: Params = []): Promise<number> {
  return call<number>('insert', sql, params)
}

/**
 * Wraps `fn` in a transaction. Statements are serialized in the worker, so this
 * is safe for the app's single-user access.
 * ponytail: no nested/concurrent transactions — fine here; revisit if that changes.
 */
export async function tx<T>(fn: () => Promise<T> | T): Promise<T> {
  await run('BEGIN')
  try {
    const result = await fn()
    await run('COMMIT')
    return result
  } catch (err) {
    await run('ROLLBACK')
    throw err
  }
}
