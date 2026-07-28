import { useEffect, useState } from 'react'
import {
  ArrowRightLeft,
  CreditCard,
  Landmark,
  Plus,
  Wallet as WalletIcon,
  type LucideIcon,
} from 'lucide-react'
import { BottomSheet, Button, Eyebrow, Input, LoadingSpinner, SelectMenu } from '../../components/ui'
import { useAccountsStore, useSettingsStore } from '../../store'
import { formatCents } from '../../lib/format'
import type { AccountType } from '../../services'
import { toCents } from './shared'

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'card', label: 'Card' },
  { value: 'wallet', label: 'Wallet' },
]
const TYPE_ICON: Record<AccountType, LucideIcon> = {
  cash: WalletIcon,
  bank: Landmark,
  card: CreditCard,
  wallet: WalletIcon,
}

export default function AccountsTab() {
  const currency = useSettingsStore((s) => s.settings?.currency ?? 'USD')
  const balances = useAccountsStore((s) => s.balances)
  const total = useAccountsStore((s) => s.total)
  const loading = useAccountsStore((s) => s.loading)
  const load = useAccountsStore((s) => s.load)
  const addAccount = useAccountsStore((s) => s.addAccount)
  const transfer = useAccountsStore((s) => s.transfer)

  useEffect(() => {
    void load()
  }, [load])

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('cash')
  const [opening, setOpening] = useState('')

  const [showTransfer, setShowTransfer] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const accountOptions = balances.map((b) => ({ value: String(b.account.id), label: b.account.name }))

  const submitAccount = async () => {
    if (!name.trim()) return
    await addAccount({ name: name.trim(), type, opening_balance_cents: toCents(opening), currency })
    setName('')
    setOpening('')
    setType('cash')
    setShowAdd(false)
  }

  const submitTransfer = async () => {
    if (!from || !to || from === to || toCents(amount) <= 0) return
    await transfer(Number(from), Number(to), toCents(amount))
    setAmount('')
    setShowTransfer(false)
  }

  return (
    <div>
      <Eyebrow>Total balance</Eyebrow>
      <p className="mt-2 text-5xl font-extrabold tracking-tight tabular-nums">
        {formatCents(total, currency)}
      </p>
      <p className="mt-2 text-sm text-text-muted">Across {balances.length} accounts</p>

      <div className="pt-6">
        {loading && balances.length === 0 ? (
          <LoadingSpinner />
        ) : balances.length === 0 ? (
          <p className="rounded-2xl border border-border-default p-4 text-sm text-text-muted">
            No accounts yet — add your first below.
          </p>
        ) : (
          <div className="divide-y divide-border-default">
            {balances.map(({ account, balance_cents }) => {
              const Icon = TYPE_ICON[account.type]
              return (
                <div key={account.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{account.name}</p>
                      <p className="text-xs capitalize text-text-muted">{account.type}</p>
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
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-6 sm:flex-row">
        <Button variant="secondary" fullWidth leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
          New account
        </Button>
        {balances.length >= 2 && (
          <Button variant="secondary" fullWidth leftIcon={<ArrowRightLeft className="h-4 w-4" />} onClick={() => setShowTransfer(true)}>
            Transfer money
          </Button>
        )}
      </div>

      {/* New account sheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="New account">
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cash" />
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-text-muted">Type</span>
            <SelectMenu options={ACCOUNT_TYPES} value={type} onChange={(v) => setType(v as AccountType)} />
          </label>
          <Input label="Opening balance" type="number" inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0.00" />
          <Button variant="primary" fullWidth onClick={submitAccount} disabled={!name.trim()}>
            Add account
          </Button>
        </div>
      </BottomSheet>

      {/* Transfer sheet */}
      <BottomSheet isOpen={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer money">
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-text-muted">From</span>
            <SelectMenu options={accountOptions} value={from || null} onChange={setFrom} placeholder="From account" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-text-muted">To</span>
            <SelectMenu options={accountOptions} value={to || null} onChange={setTo} placeholder="To account" />
          </label>
          <Input type="number" inputMode="decimal" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button variant="primary" fullWidth onClick={submitTransfer} disabled={!from || !to || from === to || toCents(amount) <= 0}>
            Transfer
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
