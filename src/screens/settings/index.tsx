import { useEffect, useState } from 'react'
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
import { useSettingsStore } from '../../store'
import { DEFAULT_SETTINGS } from '../../services/settings'
import { COUNTRIES, CURRENCIES } from '../../lib/regions'

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
  const loaded = useSettingsStore((s) => s.loaded)
  const load = useSettingsStore((s) => s.load)
  const save = useSettingsStore((s) => s.save)
  const setHue = useSettingsStore((s) => s.setHue)
  const settings = useSettingsStore((s) => s.settings) ?? DEFAULT_SETTINGS

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  // Mirror free-text inputs locally for snappy typing, then persist on change.
  const [model, setModel] = useState(settings.model)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  useEffect(() => {
    setModel(settings.model)
    setApiKey(settings.apiKey)
  }, [settings.model, settings.apiKey])

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
                    searchable
                    value={settings.country}
                    onChange={(country) => void save({ country })}
                    options={COUNTRIES}
                  />
                </div>
              }
            />
            <Row
              label="Currency"
              control={
                <div className="w-44">
                  <SelectMenu
                    searchable
                    value={settings.currency}
                    onChange={(currency) => void save({ currency })}
                    options={CURRENCIES}
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
                    value={settings.locale}
                    onChange={(locale) => void save({ locale })}
                    options={[
                      { value: 'en-US', label: '1,234.56 (US)' },
                      { value: 'en-GB', label: '1,234.56 (UK)' },
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
                  value={settings.weekStart}
                  onChange={(weekStart) => void save({ weekStart })}
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
                    value={settings.provider}
                    onChange={(provider) => void save({ provider })}
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
                    onBlur={() => void save({ model })}
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
              onBlur={() => void save({ apiKey })}
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
                style={{ backgroundColor: `hsl(${settings.themeHue} 70% 55%)` }}
                aria-hidden
              />
            </div>
            <div className="mt-4">
              <Slider
                min={0}
                max={360}
                step={1}
                value={settings.themeHue}
                valueDisplay={`${settings.themeHue}°`}
                onChange={(e) => void setHue(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <div className="pt-10">
          <Button variant="primary" fullWidth onClick={() => void save(settings)}>
            Save settings
          </Button>
        </div>
    </Screen>
  )
}
