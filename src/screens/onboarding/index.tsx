import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Button,
  Eyebrow,
  Input,
  MonsterMascot,
  SelectMenu,
} from '../../components/ui'
import { useAccountsStore, useBudgetsStore, useSettingsStore } from '../../store'
import type { AccountType, PeriodType } from '../../services'
import { COUNTRIES, CURRENCIES } from '../../lib/regions'

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank account' },
  { value: 'card', label: 'Credit card' },
  { value: 'wallet', label: 'Wallet' },
]
const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'grok', label: 'Grok' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'claude', label: 'Claude' },
]
const BUDGET_PERIODS = [
  { value: 'day', label: 'Per day' },
  { value: 'week', label: 'Per week' },
  { value: 'month', label: 'Per month' },
  { value: 'year', label: 'Per year' },
]

const STEPS = 5

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const loaded = useSettingsStore((s) => s.loaded)
  const onboarded = useSettingsStore((s) => s.settings?.onboarded)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [country, setCountry] = useState('us')
  const [currency, setCurrency] = useState('USD')
  const [accountName, setAccountName] = useState('Cash')
  const [accountType, setAccountType] = useState<AccountType>('cash')
  const [openingBalance, setOpeningBalance] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState<PeriodType>('month')
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')

  // Already set up → straight to the app.
  if (loaded && onboarded) return <Navigate to="/" replace />

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const finish = async () => {
    setSaving(true)
    try {
      await useSettingsStore.getState().save({ country, currency, provider, apiKey, onboarded: true })
      if (accountName.trim()) {
        await useAccountsStore.getState().addAccount({
          name: accountName.trim(),
          type: accountType,
          opening_balance_cents: Math.round(Number(openingBalance || 0) * 100),
          currency,
        })
      }
      if (Number(budgetAmount) > 0) {
        await useBudgetsStore.getState().create({
          amount_cents: Math.round(Number(budgetAmount) * 100),
          period_type: budgetPeriod,
          category_id: null, // overall budget
        })
      }
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-base px-4 py-8 text-text-primary sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-border-strong'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <MonsterMascot state="happy" size="xl" />
              <Eyebrow className="mt-8">Welcome to</Eyebrow>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Expensee Monster</h1>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
                Track spending by just talking. Let's set a couple of things up first.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Eyebrow>Your region</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight">Where are you?</h2>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-text-muted">Country</span>
                <SelectMenu searchable options={COUNTRIES} value={country} onChange={setCountry} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-text-muted">Currency</span>
                <SelectMenu searchable options={CURRENCIES} value={currency} onChange={setCurrency} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Eyebrow>First account</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight">Add an account</h2>
              <Input label="Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Cash" />
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-text-muted">Type</span>
                <SelectMenu
                  options={ACCOUNT_TYPES}
                  value={accountType}
                  onChange={(v) => setAccountType(v as AccountType)}
                />
              </label>
              <Input
                label="Opening balance"
                type="number"
                inputMode="decimal"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Eyebrow>Budget (optional)</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight">Set a budget</h2>
              <p className="text-sm text-text-secondary">
                We'll show what's left to spend and pace you through the period. Skip to add it later.
              </p>
              <Input
                label="Amount"
                type="number"
                inputMode="decimal"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0.00"
              />
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-text-muted">Period</span>
                <SelectMenu
                  options={BUDGET_PERIODS}
                  value={budgetPeriod}
                  onChange={(v) => setBudgetPeriod(v as PeriodType)}
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Eyebrow>AI (optional)</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight">Connect an AI model</h2>
              <p className="text-sm text-text-secondary">
                Needed for voice logging and the money coach. You can skip this and add it later in Settings.
              </p>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-text-muted">Provider</span>
                <SelectMenu options={PROVIDERS} value={provider} onChange={setProvider} />
              </label>
              <Input
                label="API key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                helperText="Stored locally on this device, never sent anywhere but the model."
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={back} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < STEPS - 1 ? (
            <Button variant="primary" onClick={next} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {step === 0 ? 'Get started' : 'Next'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={finish}
              isLoading={saving}
              rightIcon={<Check className="h-4 w-4" />}
            >
              Start tracking
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
