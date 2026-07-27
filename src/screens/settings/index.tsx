import { useState } from 'react'
import { Check, Download, KeyRound } from 'lucide-react'
import {
  Badge,
  Button,
  Eyebrow,
  Input,
  Screen,
  ScreenHeader,
  SegmentedControl,
  SelectMenu,
  Slider,
} from '../../components/ui'

function Row({
  label,
  helper,
  control,
}: {
  label: string
  helper?: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {helper && <p className="mt-0.5 text-xs text-text-muted">{helper}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export default function SettingsScreen() {
  const [country, setCountry] = useState('gb')
  const [currency, setCurrency] = useState('gbp')
  const [locale, setLocale] = useState('en-GB')
  const [weekStart, setWeekStart] = useState<'mon' | 'sun'>('mon')

  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [apiKey, setApiKey] = useState('')

  const [hue, setHue] = useState(270)

  return (
    <Screen>
        {/* Header */}
        <ScreenHeader />
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Settings</h1>

        {/* Region */}
        <section className="pt-10">
          <Eyebrow>Region</Eyebrow>
          <div className="mt-3 divide-y divide-border-default">
            <Row
              label="Country"
              helper="Sets tax and formatting defaults."
              control={
                <div className="w-44">
                  <SelectMenu
                    value={country}
                    onChange={setCountry}
                    options={[
                      { value: 'gb', label: 'United Kingdom' },
                      { value: 'us', label: 'United States' },
                      { value: 'de', label: 'Germany' },
                      { value: 'in', label: 'India' },
                    ]}
                  />
                </div>
              }
            />
            <Row
              label="Currency"
              control={
                <div className="w-44">
                  <SelectMenu
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      { value: 'gbp', label: 'GBP £' },
                      { value: 'usd', label: 'USD $' },
                      { value: 'eur', label: 'EUR €' },
                      { value: 'inr', label: 'INR ₹' },
                    ]}
                  />
                </div>
              }
            />
            <Row
              label="Number format"
              helper="How amounts and dates are written."
              control={
                <div className="w-44">
                  <SelectMenu
                    value={locale}
                    onChange={setLocale}
                    options={[
                      { value: 'en-GB', label: '1,234.56' },
                      { value: 'de-DE', label: '1.234,56' },
                      { value: 'en-IN', label: '1,23,456' },
                    ]}
                  />
                </div>
              }
            />
            <Row
              label="Week starts on"
              control={
                <SegmentedControl
                  size="sm"
                  value={weekStart}
                  onChange={setWeekStart}
                  options={[
                    { value: 'mon', label: 'Mon' },
                    { value: 'sun', label: 'Sun' },
                  ]}
                />
              }
            />
          </div>
        </section>

        {/* AI */}
        <section className="pt-10">
          <Eyebrow>AI</Eyebrow>
          <div className="mt-3 divide-y divide-border-default">
            <Row
              label="LLM provider"
              control={
                <div className="w-44">
                  <SelectMenu
                    value={provider}
                    onChange={setProvider}
                    options={[
                      { value: 'openai', label: 'OpenAI' },
                      { value: 'gemini', label: 'Gemini' },
                      { value: 'grok', label: 'Grok' },
                      { value: 'deepseek', label: 'DeepSeek' },
                      { value: 'claude', label: 'Claude' },
                    ]}
                  />
                </div>
              }
            />
            <Row
              label="Model"
              control={
                <div className="w-44">
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="model id"
                  />
                </div>
              }
            />
          </div>

          <div className="pt-4">
            <Input
              label="API key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              leftIcon={<KeyRound className="h-4 w-4" />}
              helperText="Keys are stored locally on this device and never leave it."
            />
          </div>

          <div className="mt-3 divide-y divide-border-default">
            <Row
              label="Whisper model"
              helper="Local speech-to-text for the mic."
              control={
                <div className="flex items-center gap-3">
                  <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>
                    Ready
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Re-download
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="pt-10">
          <Eyebrow>Appearance</Eyebrow>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Theme hue</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Shift the accent around the color wheel.
                </p>
              </div>
              <span
                className="h-9 w-9 shrink-0 rounded-full border border-border-default"
                style={{ backgroundColor: `hsl(${hue} 70% 55%)` }}
                aria-hidden
              />
            </div>
            <div className="mt-4">
              <Slider
                min={0}
                max={360}
                step={1}
                value={hue}
                valueDisplay={`${hue}°`}
                onChange={(e) => setHue(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <div className="pt-10">
          <Button variant="primary" fullWidth>
            Save settings
          </Button>
        </div>
    </Screen>
  )
}
