import type { SqlValue } from '@sqlite.org/sqlite-wasm'

/** Build a `col = ?, col = ?` SET clause from a column map, skipping `undefined`. */
export function buildSet(columns: Record<string, SqlValue | undefined>): {
  clause: string
  params: SqlValue[]
} {
  const keys = Object.keys(columns).filter((k) => columns[k] !== undefined)
  return {
    clause: keys.map((k) => `${k} = ?`).join(', '),
    params: keys.map((k) => columns[k] as SqlValue),
  }
}
