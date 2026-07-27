import { all, get, insert, run } from '../db/client'
import { buildSet } from '../db/sql'
import type { Account, AccountBalance, AccountPatch, ID, NewAccount, Transfer } from '../db/types'
import { nowISO } from '../lib/dates'

// Balance is computed from the ledger, never stored — see the plan/design.
const BALANCE_EXPR = `
  opening_balance_cents
  + COALESCE((SELECT SUM(amount_cents) FROM transfers WHERE to_account_id = accounts.id), 0)
  - COALESCE((SELECT SUM(amount_cents) FROM transfers WHERE from_account_id = accounts.id), 0)
  - COALESCE((SELECT SUM(amount_cents) FROM expenses  WHERE account_id    = accounts.id), 0)
`

export function listAccounts(): Promise<Account[]> {
  return all<Account>('SELECT * FROM accounts ORDER BY created_at')
}

export function getAccount(id: ID): Promise<Account | undefined> {
  return get<Account>('SELECT * FROM accounts WHERE id = ?', [id])
}

export async function createAccount(input: NewAccount): Promise<Account> {
  const id = await insert(
    'INSERT INTO accounts (name, type, opening_balance_cents, currency, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      input.name,
      input.type,
      input.opening_balance_cents ?? 0,
      input.currency ?? 'USD',
      input.icon ?? null,
      nowISO(),
    ],
  )
  return (await getAccount(id))!
}

export async function updateAccount(id: ID, patch: AccountPatch): Promise<Account | undefined> {
  const { clause, params } = buildSet({
    name: patch.name,
    type: patch.type,
    opening_balance_cents: patch.opening_balance_cents,
    currency: patch.currency,
    icon: patch.icon,
  })
  if (clause) await run(`UPDATE accounts SET ${clause} WHERE id = ?`, [...params, id])
  return getAccount(id)
}

export function deleteAccount(id: ID): Promise<void> {
  return run('DELETE FROM accounts WHERE id = ?', [id])
}

export async function getBalance(id: ID): Promise<number> {
  const row = await get<{ balance: number }>(
    `SELECT (${BALANCE_EXPR}) AS balance FROM accounts WHERE id = ?`,
    [id],
  )
  return Number(row?.balance ?? 0)
}

export async function listBalances(): Promise<AccountBalance[]> {
  const rows = await all<Account & { balance_cents: number }>(
    `SELECT *, (${BALANCE_EXPR}) AS balance_cents FROM accounts ORDER BY created_at`,
  )
  return rows.map(({ balance_cents, ...account }) => ({
    account: account as Account,
    balance_cents: Number(balance_cents),
  }))
}

export async function totalBalance(): Promise<number> {
  const row = await get<{ total: number }>(
    `SELECT COALESCE(SUM(${BALANCE_EXPR}), 0) AS total FROM accounts`,
  )
  return Number(row?.total ?? 0)
}

export function listTransfers(accountId?: ID): Promise<Transfer[]> {
  if (accountId != null) {
    return all<Transfer>(
      'SELECT * FROM transfers WHERE from_account_id = ? OR to_account_id = ? ORDER BY transferred_at DESC, id DESC',
      [accountId, accountId],
    )
  }
  return all<Transfer>('SELECT * FROM transfers ORDER BY transferred_at DESC, id DESC')
}

export async function transfer(
  fromAccountId: ID,
  toAccountId: ID,
  amountCents: number,
  note: string | null = null,
): Promise<Transfer> {
  if (fromAccountId === toAccountId) throw new Error('Cannot transfer to the same account')
  if (amountCents <= 0) throw new Error('Transfer amount must be positive')
  const now = nowISO()
  const id = await insert(
    'INSERT INTO transfers (from_account_id, to_account_id, amount_cents, note, transferred_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [fromAccountId, toAccountId, amountCents, note, now, now],
  )
  return (await get<Transfer>('SELECT * FROM transfers WHERE id = ?', [id]))!
}
