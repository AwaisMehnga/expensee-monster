import { create } from 'zustand'
import { settings as api, type AppSettings } from '../services'

function applyHue(hue: number) {
  document.documentElement.style.setProperty('--primary-hue', String(hue))
}

interface SettingsState {
  settings: AppSettings | null
  loaded: boolean
  load: () => Promise<void>
  save: (patch: Partial<AppSettings>) => Promise<void>
  setHue: (hue: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loaded: false,
  load: async () => {
    const settings = await api.getSettings()
    applyHue(settings.themeHue)
    set({ settings, loaded: true })
  },
  save: async (patch) => {
    const settings = await api.saveSettings(patch)
    if (patch.themeHue !== undefined) applyHue(settings.themeHue)
    set({ settings })
  },
  setHue: async (hue) => {
    applyHue(hue)
    await get().save({ themeHue: hue })
  },
}))
