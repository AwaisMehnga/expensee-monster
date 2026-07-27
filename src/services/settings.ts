import { all, run } from '../db/client'
import type { AppSettings } from '../db/types'

export const DEFAULT_SETTINGS: AppSettings = {
  onboarded: false,
  country: 'us',
  currency: 'USD',
  locale: 'en-US',
  weekStart: 'mon',
  provider: 'openai',
  model: '',
  apiKey: '',
  themeHue: 250,
}

// Values are JSON-encoded so booleans/numbers round-trip through TEXT.

/** Read a single setting; returns `fallback` if unset or unparseable. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const rows = await all<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])
  if (!rows.length) return fallback
  try {
    return JSON.parse(rows[0].value) as T
  } catch {
    return fallback
  }
}

/** Upsert a single setting (any global/app value). */
export function setSetting(key: string, value: unknown): Promise<void> {
  return run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, JSON.stringify(value)],
  )
}

/** All app settings, stored values merged over the defaults. */
export async function getSettings(): Promise<AppSettings> {
  const rows = await all<{ key: string; value: string }>('SELECT key, value FROM settings')
  const stored: Partial<AppSettings> = {}
  for (const { key, value } of rows) {
    if (key in DEFAULT_SETTINGS) {
      try {
        stored[key as keyof AppSettings] = JSON.parse(value)
      } catch {
        /* ignore bad row, fall back to default */
      }
    }
  }
  return { ...DEFAULT_SETTINGS, ...stored }
}

/** Persist a partial update; returns the full merged settings. */
export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  for (const [key, value] of Object.entries(patch)) {
    await setSetting(key, value)
  }
  return getSettings()
}

export function isOnboarded(): Promise<boolean> {
  return getSetting<boolean>('onboarded', false)
}

export function setOnboarded(value = true): Promise<void> {
  return setSetting('onboarded', value)
}
