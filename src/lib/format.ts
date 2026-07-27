/** Format a money amount. `amount` is in major units (e.g. dollars). */
export function formatMoney(amount: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

/** Grouped amount with no currency symbol (e.g. "1,234.56") — for when the symbol is rendered separately. */
export function formatAmount(amount: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format integer cents (the DB storage unit) as money. */
export function formatCents(cents: number, currency = 'USD', locale = 'en-US') {
  return formatMoney(cents / 100, currency, locale)
}
