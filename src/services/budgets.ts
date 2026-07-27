import { all, get, insert, run } from '../db/client'
import { buildSet } from '../db/sql'
import type { Budget, BudgetPatch, BudgetStatus, ID, NewBudget } from '../db/types'
import { daysRemaining, nowISO, periodWindow, todayISODate } from '../lib/dates'
import { totalSpent } from './analytics'

export function listBudgets(): Promise<Budget[]> {
  return all<Budget>('SELECT * FROM budgets ORDER BY created_at DESC')
}

export function getBudget(id: ID): Promise<Budget | undefined> {
  return get<Budget>('SELECT * FROM budgets WHERE id = ?', [id])
}

export async function createBudget(input: NewBudget): Promise<Budget> {
  const id = await insert(
    'INSERT INTO budgets (amount_cents, period_type, start_date, end_date, category_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      input.amount_cents,
      input.period_type,
      input.start_date ?? todayISODate(),
      input.end_date ?? null,
      input.category_id ?? null,
      nowISO(),
    ],
  )
  return (await getBudget(id))!
}

export async function updateBudget(id: ID, patch: BudgetPatch): Promise<Budget | undefined> {
  const { clause, params } = buildSet({
    amount_cents: patch.amount_cents,
    period_type: patch.period_type,
    start_date: patch.start_date,
    end_date: patch.end_date,
    category_id: patch.category_id,
  })
  if (clause) await run(`UPDATE budgets SET ${clause} WHERE id = ?`, [...params, id])
  return getBudget(id)
}

export function deleteBudget(id: ID): Promise<void> {
  return run('DELETE FROM budgets WHERE id = ?', [id])
}

/** Budget vs spend for its current window, with pacing (per-day left). */
export async function getBudgetStatus(budget: Budget, weekStartsOn: 0 | 1 = 1): Promise<BudgetStatus> {
  const win = periodWindow(budget.period_type, new Date(), {
    weekStartsOn,
    startDate: budget.start_date,
    endDate: budget.end_date,
  })
  const spent = await totalSpent({
    from: win.start,
    to: win.end,
    categoryId: budget.category_id ?? undefined,
  })
  const leftover = budget.amount_cents - spent
  const remaining = daysRemaining(win.end)
  return {
    budget,
    window_start: win.start,
    window_end: win.end,
    spent_cents: spent,
    leftover_cents: leftover,
    days_remaining: remaining,
    per_day_left_cents: remaining > 0 ? Math.floor(leftover / remaining) : leftover,
  }
}

export async function listBudgetStatuses(weekStartsOn: 0 | 1 = 1): Promise<BudgetStatus[]> {
  const budgets = await listBudgets()
  return Promise.all(budgets.map((b) => getBudgetStatus(b, weekStartsOn)))
}
