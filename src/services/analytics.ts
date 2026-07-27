import { all, get } from '../db/client'
import type { CategoryTotal, ExpenseFilter, PlaceTotal, TrendPoint } from '../db/types'
import { expenseWhere } from './expenses'

export async function totalSpent(filter?: ExpenseFilter): Promise<number> {
  const { clause, params } = expenseWhere(filter)
  const row = await get<{ total: number }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total FROM expenses ${clause}`,
    params,
  )
  return Number(row?.total ?? 0)
}

export function unnecessaryTotal(filter?: ExpenseFilter): Promise<number> {
  return totalSpent({ ...filter, onlyUnnecessary: true })
}

export function spendByCategory(filter?: ExpenseFilter): Promise<CategoryTotal[]> {
  const { clause, params } = expenseWhere(filter)
  return all<CategoryTotal>(
    `SELECT
        category_id,
        (SELECT name FROM categories WHERE categories.id = expenses.category_id) AS category_name,
        SUM(amount_cents) AS total_cents
     FROM expenses ${clause}
     GROUP BY category_id
     ORDER BY total_cents DESC`,
    params,
  )
}

export function topPlaces(filter?: ExpenseFilter, limit = 10): Promise<PlaceTotal[]> {
  const { clause, params } = expenseWhere(filter)
  const where = clause ? `${clause} AND place IS NOT NULL` : 'WHERE place IS NOT NULL'
  return all<PlaceTotal>(
    `SELECT place, SUM(amount_cents) AS total_cents
     FROM expenses ${where}
     GROUP BY place
     ORDER BY total_cents DESC
     LIMIT ?`,
    [...params, limit],
  )
}

/** Spend totals bucketed by day (`%Y-%m-%d`) or month (`%Y-%m`) for trend charts. */
export function trend(bucket: 'day' | 'month', filter?: ExpenseFilter): Promise<TrendPoint[]> {
  const { clause, params } = expenseWhere(filter)
  const fmt = bucket === 'day' ? '%Y-%m-%d' : '%Y-%m'
  return all<TrendPoint>(
    `SELECT strftime('${fmt}', spent_at) AS bucket, SUM(amount_cents) AS total_cents
     FROM expenses ${clause}
     GROUP BY bucket
     ORDER BY bucket`,
    params,
  )
}
