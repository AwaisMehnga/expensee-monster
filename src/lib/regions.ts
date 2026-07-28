import { getData } from 'country-list'

export interface Option {
  value: string
  label: string
}

// Countries — ISO 3166 list from `country-list`, value is the lowercase code.
export const COUNTRIES: Option[] = getData()
  .map((c) => ({ value: c.code.toLowerCase(), label: c.name }))
  .sort((a, b) => a.label.localeCompare(b.label))

// Currencies — native `Intl` (no dependency); labelled with the localized name.
function currencyOptions(): Option[] {
  const supported = (Intl as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
  const codes = supported
    ? supported('currency')
    : ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF']
  let names: Intl.DisplayNames | undefined
  try {
    names = new Intl.DisplayNames(['en'], { type: 'currency' })
  } catch {
    names = undefined
  }
  return codes.map((code) => ({
    value: code,
    label: names ? `${code} — ${names.of(code) ?? code}` : code,
  }))
}

export const CURRENCIES: Option[] = currencyOptions()
