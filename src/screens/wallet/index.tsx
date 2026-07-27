import { useState } from 'react'
import {
  ArrowRightLeft,
  CreditCard,
  Landmark,
  Plus,
  Wallet as WalletIcon,
  type LucideIcon,
} from 'lucide-react'
import { Button, Eyebrow, ProgressBar, Screen, ScreenHeader, SelectMenu } from '../../components/ui'
import { formatMoney } from '../../lib/format'

type Account = {
  id: string
  name: string
  type: string
  balance: number
  icon: LucideIcon
}

type Budget = {
  id: string
  name: string
  period: string
  spent: string
  limit: string
  percent: number
}

const accounts: Account[] = [
  { id: '1', name: 'Cash', type: 'Wallet', balance: 240, icon: WalletIcon },
  { id: '2', name: 'Chase Debit', type: 'Bank account', balance: 1820.5, icon: Landmark },
  { id: '3', name: 'Visa Credit', type: 'Credit card', balance: -310.2, icon: CreditCard },
]

const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

const accountOptions = accounts.map((account) => ({ value: account.id, label: account.name }))

const budgets: Budget[] = [
  { id: '1', name: 'Overall', period: 'This month', spent: '$820', limit: '$1,500', percent: 55 },
  { id: '2', name: 'Food & coffee', period: 'This week', spent: '$64', limit: '$120', percent: 53 },
  { id: '3', name: 'Transport', period: 'This month', spent: '$180', limit: '$200', percent: 90 },
]

const inputClass =
  'w-full rounded-2xl border border-border-default bg-surface-base px-4 py-3 text-sm font-semibold text-text-primary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100'

export default function WalletScreen() {
  const [fromAccount, setFromAccount] = useState(accounts[0].id)
  const [toAccount, setToAccount] = useState(accounts[1].id)

  return (
    <Screen>
        {/* Header */}
        <ScreenHeader
          action={
            <button
              type="button"
              className="rounded-full p-2 text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
              aria-label="Add account"
            >
              <Plus className="h-5 w-5" />
            </button>
          }
        />

        {/* Hero — total balance */}
        <section className="pt-8">
          <Eyebrow>Total balance</Eyebrow>
          <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">{formatMoney(totalBalance)}</p>
          <p className="mt-2 text-sm text-text-muted">Across {accounts.length} accounts</p>
        </section>

        {/* Accounts — hairline rows */}
        <section className="pt-12">
          <Eyebrow>Accounts</Eyebrow>
          <div className="mt-3 divide-y divide-border-default">
            {accounts.map((account) => {
              const Icon = account.icon
              return (
                <div key={account.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{account.name}</p>
                      <p className="text-xs text-text-muted">{account.type}</p>
                    </div>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums">{formatMoney(account.balance)}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Transfer money */}
        <section className="pt-12">
          <Eyebrow>Transfer money</Eyebrow>
          <p className="mt-2 text-sm text-text-muted">Move funds between your accounts.</p>

          <div className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-text-muted">From</span>
              <SelectMenu options={accountOptions} value={fromAccount} onChange={setFromAccount} />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-text-muted">To</span>
              <SelectMenu options={accountOptions} value={toAccount} onChange={setToAccount} />
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-text-muted">Amount</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className={`${inputClass} tabular-nums`}
              />
            </label>
            <Button
              variant="primary"
              fullWidth
              className="mt-1"
              leftIcon={<ArrowRightLeft className="h-4 w-4" />}
              disabled={fromAccount === toAccount}
            >
              Transfer
            </Button>
            {fromAccount === toAccount && (
              <p className="text-xs text-text-muted">Pick two different accounts to transfer.</p>
            )}
          </div>
        </section>

        {/* Budgets */}
        <section className="pt-12">
          <Eyebrow>Budgets</Eyebrow>
          <div className="mt-4 space-y-6">
            {budgets.map((budget) => (
              <div key={budget.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-text-primary">{budget.name}</p>
                  <p className="text-xs text-text-muted">{budget.period}</p>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={budget.percent}
                    label={`${budget.spent} of ${budget.limit}`}
                    color={budget.percent >= 90 ? 'danger' : 'primary'}
                  />
                </div>
                {budget.percent >= 90 && (
                  <p className="mt-1.5 text-xs font-medium text-status-danger">
                    {budget.percent}% used — close to the limit.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
    </Screen>
  )
}
