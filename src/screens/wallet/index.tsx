import { useEffect, useState } from 'react'
import {
  ArrowRightLeft,
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  Wallet as WalletIcon,
  type LucideIcon,
} from 'lucide-react'
import {
  Button,
  EmptyState,
  Eyebrow,
  Input,
  LoadingSpinner,
  Modal,
  ProgressBar,
  Screen,
  ScreenHeader,
  SelectMenu,
} from '../../components/ui'
import { formatCents } from '../../lib/format'
import {
  useAccountsStore,
  useBudgetsStore,
  useCategoriesStore,
  useSettingsStore,
} from '../../store'
import type { AccountType, PeriodType } from '../../services'

const typeIcon: Record<AccountType, LucideIcon> = {
  cash: Banknote,
  bank: Landmark,
  card: CreditCard,
  wallet: WalletIcon,
}

const typeLabel: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank account',
  card: 'Card',
  wallet: 'Wallet',
}

const accountTypeOptions = (Object.keys(typeLabel) as AccountType[]).map((t) => ({
  value: t,
  label: typeLabel[t],
}))

const periodLabel: Record<PeriodType, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  custom: 'Custom',
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]

export default function WalletScreen() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const weekStart = useSettingsStore((s) => s.settings?.weekStart)

  const balances = useAccountsStore((s) => s.balances)
  const total = useAccountsStore((s) => s.total)
  const accountsLoading = useAccountsStore((s) => s.loading)
  const loadAccounts = useAccountsStore((s) => s.load)
  const addAccount = useAccountsStore((s) => s.addAccount)
  const transfer = useAccountsStore((s) => s.transfer)

  const statuses = useBudgetsStore((s) => s.statuses)
  const budgetsLoading = useBudgetsStore((s) => s.loading)
  const loadBudgets = useBudgetsStore((s) => s.load)
  const createBudget = useBudgetsStore((s) => s.create)

  const categories = useCategoriesStore((s) => s.items)
  const loadCategories = useCategoriesStore((s) => s.load)

  useEffect(() => {
    void loadAccounts()
    void loadBudgets(weekStart)
    void loadCategories()
  }, [loadAccounts, loadBudgets, loadCategories, weekStart])

  // Transfer form
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')

  // Default the transfer selects once accounts are available.
  useEffect(() => {
    if (balances.length === 0) return
    setFromAccount((cur) => cur || String(balances[0].account.id))
    setToAccount((cur) => cur || String((balances[1] ?? balances[0]).account.id))
  }, [balances])

  const accountOptions = balances.map((b) => ({
    value: String(b.account.id),
    label: b.account.name,
  }))

  const amountNumber = Number(amount)
  const transferDisabled =
    balances.length === 0 || fromAccount === toAccount || !amount || amountNumber <= 0

  const handleTransfer = async () => {
    if (transferDisabled) return
    await transfer(Number(fromAccount), Number(toAccount), Math.round(amountNumber * 100))
    setAmount('')
  }

  // Add account modal
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<AccountType>('cash')
  const [newOpening, setNewOpening] = useState('')

  const handleAddAccount = async () => {
    if (!newName.trim()) return
    await addAccount({
      name: newName.trim(),
      type: newType,
      opening_balance_cents: Math.round(Number(newOpening || 0) * 100),
    })
    setAddOpen(false)
    setNewName('')
    setNewType('cash')
    setNewOpening('')
  }

  // New budget modal
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState<PeriodType>('month')
  const [budgetCategory, setBudgetCategory] = useState('overall')

  const handleCreateBudget = async () => {
    const cents = Math.round(Number(budgetAmount) * 100)
    if (!cents || cents <= 0) return
    await createBudget({
      amount_cents: cents,
      period_type: budgetPeriod,
      category_id: budgetCategory === 'overall' ? null : Number(budgetCategory),
    })
    setBudgetOpen(false)
    setBudgetAmount('')
    setBudgetPeriod('month')
    setBudgetCategory('overall')
  }

  const categoryOptions = [
    { value: 'overall', label: 'Overall' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ]

  return (
    <Screen>
      {/* Header */}
      <ScreenHeader
        action={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
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
        <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
          {formatCents(total, currency)}
        </p>
        <p className="mt-2 text-sm text-text-muted">Across {balances.length} accounts</p>
      </section>

      {/* Accounts — hairline rows */}
      <section className="pt-12">
        <Eyebrow>Accounts</Eyebrow>
        {accountsLoading ? (
          <LoadingSpinner />
        ) : balances.length === 0 ? (
          <EmptyState
            icon={<WalletIcon className="h-12 w-12" strokeWidth={1.5} />}
            title="No accounts yet — add one"
            actionLabel="Add account"
            onAction={() => setAddOpen(true)}
          />
        ) : (
          <div className="mt-3 divide-y divide-border-default">
            {balances.map(({ account, balance_cents }) => {
              const Icon = typeIcon[account.type]
              return (
                <div key={account.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{account.name}</p>
                      <p className="text-xs text-text-muted">{typeLabel[account.type]}</p>
                    </div>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums">
                    {formatCents(balance_cents, currency)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Transfer money */}
      <section className="pt-12">
        <Eyebrow>Transfer money</Eyebrow>
        <p className="mt-2 text-sm text-text-muted">Move funds between your accounts.</p>

        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-muted">From</span>
            <SelectMenu
              options={accountOptions}
              value={fromAccount || null}
              onChange={setFromAccount}
              placeholder="Select account"
              disabled={balances.length === 0}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-muted">To</span>
            <SelectMenu
              options={accountOptions}
              value={toAccount || null}
              onChange={setToAccount}
              placeholder="Select account"
              disabled={balances.length === 0}
            />
          </div>
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            variant="primary"
            fullWidth
            className="mt-1"
            leftIcon={<ArrowRightLeft className="h-4 w-4" />}
            disabled={transferDisabled}
            onClick={() => void handleTransfer()}
          >
            Transfer
          </Button>
          {balances.length > 0 && fromAccount === toAccount && (
            <p className="text-xs text-text-muted">Pick two different accounts to transfer.</p>
          )}
        </div>
      </section>

      {/* Budgets */}
      <section className="pt-12">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>Budgets</Eyebrow>
          <Button variant="ghost" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setBudgetOpen(true)}>
            New budget
          </Button>
        </div>
        {budgetsLoading ? (
          <LoadingSpinner />
        ) : statuses.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No budgets yet.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {statuses.map(({ budget, spent_cents }) => {
              const category = categories.find((c) => c.id === budget.category_id)
              const name = category ? category.name : 'Overall'
              const percent = budget.amount_cents
                ? Math.min(100, Math.round((spent_cents / budget.amount_cents) * 100))
                : 0
              return (
                <div key={budget.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-text-primary">{name}</p>
                    <p className="text-xs text-text-muted">{periodLabel[budget.period_type]}</p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={percent}
                      label={`${formatCents(spent_cents, currency)} of ${formatCents(budget.amount_cents, currency)}`}
                      color={percent >= 90 ? 'danger' : 'primary'}
                    />
                  </div>
                  {percent >= 90 && (
                    <p className="mt-1.5 text-xs font-medium text-status-danger">
                      {percent}% used — close to the limit.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Add account modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add account"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={!newName.trim()} onClick={() => void handleAddAccount()}>
              Add account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Chase Debit"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-text-secondary">Type</span>
            <SelectMenu
              options={accountTypeOptions}
              value={newType}
              onChange={(v) => setNewType(v as AccountType)}
            />
          </div>
          <Input
            label="Opening balance"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            value={newOpening}
            onChange={(e) => setNewOpening(e.target.value)}
          />
        </div>
      </Modal>

      {/* New budget modal */}
      <Modal
        isOpen={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        title="New budget"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setBudgetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!budgetAmount || Number(budgetAmount) <= 0}
              onClick={() => void handleCreateBudget()}
            >
              Create budget
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            className="tabular-nums"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
          />
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-text-secondary">Period</span>
            <SelectMenu
              options={periodOptions}
              value={budgetPeriod}
              onChange={(v) => setBudgetPeriod(v as PeriodType)}
            />
          </div>
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-text-secondary">Category</span>
            <SelectMenu
              options={categoryOptions}
              value={budgetCategory}
              onChange={setBudgetCategory}
            />
          </div>
        </div>
      </Modal>
    </Screen>
  )
}
