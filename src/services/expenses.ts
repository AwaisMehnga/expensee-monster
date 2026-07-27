import { all, get, insert, run, type Params } from '../db/client'
import { buildSet } from '../db/sql'
import type { Expense, ExpenseFilter, ExpensePatch, ID, NewExpense } from '../db/types'
import { nowISO } from '../lib/dates'

/** Shared WHERE builder — reused by analytics so filtering stays consistent. */
export function expenseWhere(filter: ExpenseFilter = {}): { clause: string; params: Params } {
  const conds: string[] = []
  const params: Params = []
  if (filter.from) {
    conds.push('date(spent_at) >= date(?)')
    params.push(filter.from)
  }
  if (filter.to) {
    conds.push('date(spent_at) <= date(?)')
    params.push(filter.to)
  }
  if (filter.categoryId != null) {
    conds.push('category_id = ?')
    params.push(filter.categoryId)
  }
  if (filter.accountId != null) {
    conds.push('account_id = ?')
    params.push(filter.accountId)
  }
  if (filter.place) {
    conds.push('place = ?')
    params.push(filter.place)
  }
  if (filter.onlyUnnecessary) conds.push('is_unnecessary = 1')
  if (filter.search) {
    const q = `%${filter.search}%`
    conds.push('(item LIKE ? OR place LIKE ? OR note LIKE ?)')
    params.push(q, q, q)
  }
  return { clause: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params }
}

export function listExpenses(filter?: ExpenseFilter): Promise<Expense[]> {
  const { clause, params } = expenseWhere(filter)
  return all<Expense>(`SELECT * FROM expenses ${clause} ORDER BY spent_at DESC, id DESC`, params)
}

export function getExpense(id: ID): Promise<Expense | undefined> {
  return get<Expense>('SELECT * FROM expenses WHERE id = ?', [id])
}

export async function createExpense(input: NewExpense): Promise<Expense> {
  const now = nowISO()
  const id = await insert(
    `INSERT INTO expenses
      (item, amount_cents, currency, place, category_id, account_id, note,
       is_unnecessary, unnecessary_reason, source, raw_transcript, spent_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.item,
      input.amount_cents,
      input.currency ?? 'USD',
      input.place ?? null,
      input.category_id ?? null,
      input.account_id ?? null,
      input.note ?? null,
      input.is_unnecessary ? 1 : 0,
      input.unnecessary_reason ?? null,
      input.source ?? 'manual',
      input.raw_transcript ?? null,
      input.spent_at ?? now,
      now,
      now,
    ],
  )
  return (await getExpense(id))!
}

export async function updateExpense(id: ID, patch: ExpensePatch): Promise<Expense | undefined> {
  const { clause, params } = buildSet({
    item: patch.item,
    amount_cents: patch.amount_cents,
    currency: patch.currency,
    place: patch.place,
    category_id: patch.category_id,
    account_id: patch.account_id,
    note: patch.note,
    is_unnecessary: patch.is_unnecessary === undefined ? undefined : patch.is_unnecessary ? 1 : 0,
    unnecessary_reason: patch.unnecessary_reason,
    source: patch.source,
    raw_transcript: patch.raw_transcript,
    spent_at: patch.spent_at,
    updated_at: nowISO(),
  })
  await run(`UPDATE expenses SET ${clause} WHERE id = ?`, [...params, id])
  return getExpense(id)
}

export function deleteExpense(id: ID): Promise<void> {
  return run('DELETE FROM expenses WHERE id = ?', [id])
}

export async function markUnnecessary(
  id: ID,
  unnecessary: boolean,
  reason: string | null = null,
): Promise<Expense | undefined> {
  await run(
    'UPDATE expenses SET is_unnecessary = ?, unnecessary_reason = ?, updated_at = ? WHERE id = ?',
    [unnecessary ? 1 : 0, unnecessary ? reason : null, nowISO(), id],
  )
  return getExpense(id)
}
