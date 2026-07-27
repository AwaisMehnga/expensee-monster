// Domain models — mirror the SQLite schema. Money is always integer cents.

export type ID = number
export type ExpenseSource = 'voice' | 'manual'
export type AccountType = 'cash' | 'bank' | 'card' | 'wallet'
export type PeriodType = 'day' | 'week' | 'month' | 'year' | 'custom'
export type WeekStart = 'mon' | 'sun'

/** App-wide settings, persisted in the `settings` key-value table. */
export interface AppSettings {
  onboarded: boolean
  country: string
  currency: string
  locale: string
  weekStart: WeekStart
  provider: string
  model: string
  apiKey: string
  themeHue: number
}

export interface Category {
  id: ID
  name: string
  icon: string | null
  created_at: string
}

export interface Account {
  id: ID
  name: string
  type: AccountType
  opening_balance_cents: number
  currency: string
  icon: string | null
  created_at: string
}

export interface Expense {
  id: ID
  item: string
  amount_cents: number
  currency: string
  place: string | null
  category_id: ID | null
  account_id: ID | null
  note: string | null
  is_unnecessary: number // 0 | 1
  unnecessary_reason: string | null
  source: ExpenseSource
  raw_transcript: string | null
  spent_at: string
  created_at: string
  updated_at: string
}

export interface Transfer {
  id: ID
  from_account_id: ID
  to_account_id: ID
  amount_cents: number
  note: string | null
  transferred_at: string
  created_at: string
}

export interface Budget {
  id: ID
  amount_cents: number
  period_type: PeriodType
  start_date: string
  end_date: string | null
  category_id: ID | null
  created_at: string
}

// ── Input shapes (create/update) ─────────────────────────────────────────

export interface NewExpense {
  item: string
  amount_cents: number
  currency?: string
  place?: string | null
  category_id?: ID | null
  account_id?: ID | null
  note?: string | null
  source?: ExpenseSource
  raw_transcript?: string | null
  spent_at?: string // ISO; defaults to now
  is_unnecessary?: boolean
  unnecessary_reason?: string | null
}
export type ExpensePatch = Partial<NewExpense>

export interface NewAccount {
  name: string
  type: AccountType
  opening_balance_cents?: number
  currency?: string
  icon?: string | null
}
export type AccountPatch = Partial<NewAccount>

export interface NewBudget {
  amount_cents: number
  period_type: PeriodType
  start_date?: string // ISO date; defaults to today
  end_date?: string | null
  category_id?: ID | null
}
export type BudgetPatch = Partial<NewBudget>

// ── Query / derived shapes ───────────────────────────────────────────────

export interface ExpenseFilter {
  from?: string // ISO date inclusive
  to?: string // ISO date inclusive
  categoryId?: ID
  accountId?: ID
  place?: string
  onlyUnnecessary?: boolean
  search?: string
}

export interface AccountBalance {
  account: Account
  balance_cents: number
}

export interface CategoryTotal {
  category_id: ID | null
  category_name: string | null
  total_cents: number
}

export interface PlaceTotal {
  place: string
  total_cents: number
}

export interface TrendPoint {
  bucket: string // e.g. '2026-07' or '2026-07-28'
  total_cents: number
}

export interface BudgetStatus {
  budget: Budget
  window_start: string
  window_end: string
  spent_cents: number
  leftover_cents: number
  days_remaining: number
  per_day_left_cents: number
}
